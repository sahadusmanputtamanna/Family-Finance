import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { formatIndianNumber } from '../utils/numberFormat';
import { notificationService } from '../services/NotificationService';
import { realtimeService } from '../services/RealtimeService';
import { pushNotificationService } from '../services/PushNotificationService';
import { firebaseService } from '../services/FirebaseService';

const AppContext = createContext();

const INITIAL_FAMILY_SETTINGS = {
  familyName: 'Family Finance',
  currency: '₹',
  notificationPreferences: {
    incomeEnabled: true,
    expenseEnabled: true,
    editEnabled: true,
    deleteEnabled: true,
    monthlyReportEnabled: true,
    backupEnabled: true
  }
};

const INITIAL_INCOME_SOURCES = [
  'Salary',
  'Business',
  'Freelance',
  'Investment',
  'Rental Income',
  'Other Income'
];

// Secure SHA-256 PIN Hashing via Web Crypto API
export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AppProvider = ({ children }) => {
  const adminProfile = {
    name: 'Admin',
    role: 'Admin',
    avatar: '👤'
  };

  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path === '' ? '/' : path;
    }
    return '/';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('ffh_admin_auth') === 'true';
  });

  const [authSession, setAuthSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quick Unlock Settings State
  const [quickUnlockSettings, setQuickUnlockSettings] = useState(() => {
    const saved = localStorage.getItem('ffh_quick_unlock');
    return saved ? JSON.parse(saved) : { enabled: false, pinHash: null, fingerprintEnabled: false, failedAttempts: 0 };
  });

  const [isQuickUnlocked, setIsQuickUnlocked] = useState(false);
  const [showSetupQuickUnlockModal, setShowSetupQuickUnlockModal] = useState(false);

  // ----------------------------------------------------
  // PRIMITIVE SHARED STATE (PURE SUPABASE SOURCE OF TRUTH - ZERO LOCALSTORAGE CACHE FOR DATA)
  // ----------------------------------------------------
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [familySettings, setFamilySettingsState] = useState(INITIAL_FAMILY_SETTINGS);

  const [receiptModalUrl, setReceiptModalUrl] = useState(null);
  const [receiptModalTitle, setReceiptModalTitle] = useState('');

  // Clear legacy mock localStorage items on mount so stale data never contaminates state
  useEffect(() => {
    try {
      localStorage.removeItem('ffh_transactions');
      localStorage.removeItem('ffh_family_members');
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  useEffect(() => {
    localStorage.setItem('ffh_quick_unlock', JSON.stringify(quickUnlockSettings));
  }, [quickUnlockSettings]);

  // Supabase Auth Listener
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setAuthSession(session);
          setIsAdminAuthenticated(true);
          localStorage.setItem('ffh_admin_auth', 'true');
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthSession(session);
        if (session) {
          setIsAdminAuthenticated(true);
          localStorage.setItem('ffh_admin_auth', 'true');
        } else {
          setIsAdminAuthenticated(false);
          setIsQuickUnlocked(false);
          localStorage.removeItem('ffh_admin_auth');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Supabase Auth Login with Admin Login Notification Trigger
  const loginAdmin = async (email, password) => {
    if (!email || !password) {
      showToast('Please provide both email and password.', 'warning');
      return false;
    }

    let success = false;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        showToast('Invalid email or password.', 'error');
        return false;
      }

      setAuthSession(data.session);
      setIsAdminAuthenticated(true);
      setIsQuickUnlocked(true);
      localStorage.setItem('ffh_admin_auth', 'true');
      setQuickUnlockSettings(prev => ({ ...prev, failedAttempts: 0 }));

      if (!quickUnlockSettings.enabled) {
        setShowSetupQuickUnlockModal(true);
      }
      success = true;
    } else {
      if (email.trim().toLowerCase() === 'admin@family.com' && password === 'admin123') {
        setIsAdminAuthenticated(true);
        setIsQuickUnlocked(true);
        localStorage.setItem('ffh_admin_auth', 'true');
        setQuickUnlockSettings(prev => ({ ...prev, failedAttempts: 0 }));
        if (!quickUnlockSettings.enabled) setShowSetupQuickUnlockModal(true);
        success = true;
      } else {
        showToast('Invalid email or password.', 'error');
        return false;
      }
    }

    if (success) {
      showToast('Admin logged in successfully', 'success');
      await createNotification('Admin Login', `Admin session authenticated from ${window.navigator.platform || 'Device'}`, 'auth');
      navigate('/admin/dashboard');
      return true;
    }
  };

  const verifyQuickPin = async (pinInput) => {
    if (!quickUnlockSettings.enabled || !quickUnlockSettings.pinHash) return false;
    const inputHash = await hashPin(pinInput);

    if (inputHash === quickUnlockSettings.pinHash) {
      setIsQuickUnlocked(true);
      setQuickUnlockSettings(prev => ({ ...prev, failedAttempts: 0 }));
      showToast('Quick Unlock successful!', 'success');
      return true;
    } else {
      const newAttempts = (quickUnlockSettings.failedAttempts || 0) + 1;
      if (newAttempts >= 5) {
        setQuickUnlockSettings(prev => ({ ...prev, failedAttempts: newAttempts }));
        setIsAdminAuthenticated(false);
        setIsQuickUnlocked(false);
        localStorage.removeItem('ffh_admin_auth');
        showToast('Too many failed PIN attempts. Please sign in with email and password.', 'error');
        return false;
      } else {
        setQuickUnlockSettings(prev => ({ ...prev, failedAttempts: newAttempts }));
        showToast(`Invalid Quick PIN. ${5 - newAttempts} attempts remaining.`, 'error');
        return false;
      }
    }
  };

  const setupQuickUnlock = async (pinInput, fingerprintEnabled = false) => {
    if (!pinInput || pinInput.length !== 4) {
      showToast('Please enter a 4-digit PIN.', 'warning');
      return false;
    }
    const hashed = await hashPin(pinInput);
    setQuickUnlockSettings({
      enabled: true,
      pinHash: hashed,
      fingerprintEnabled: fingerprintEnabled,
      failedAttempts: 0
    });
    setShowSetupQuickUnlockModal(false);
    showToast('Quick Unlock configured securely!', 'success');
    await createNotification('Quick PIN Configured', 'Admin Quick PIN security code updated', 'settings');
    return true;
  };

  const logoutAdmin = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setAuthSession(null);
    setIsAdminAuthenticated(false);
    setIsQuickUnlocked(false);
    localStorage.removeItem('ffh_admin_auth');
    showToast('Admin logged out', 'info');
    navigate('/admin/login');
  };

  const setFamilySettings = async (newSettings) => {
    setFamilySettingsState(newSettings);
    await createNotification('Notification Settings Updated', 'Family notification preferences updated', 'settings');
  };

  // ----------------------------------------------------
  // DYNAMIC DERIVATIONS (SINGLE SOURCE OF TRUTH COMPUTATIONS)
  // ----------------------------------------------------

  const totalIncome = useMemo(() => {
    return income.reduce((acc, i) => acc + Number(i.amount || 0), 0);
  }, [income]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  }, [expenses]);

  const currentBalance = totalIncome - totalExpense;

  const transactions = useMemo(() => {
    let merged = [];

    income.forEach(i => {
      const m = familyMembers.find(mem => mem.id === i.member_id || mem.name === i.member_id);
      merged.push({
        ...i,
        type: 'income',
        source: i.source,
        member: m ? m.name : (i.member_id || 'Family Member'),
        member_id: i.member_id,
        note: i.note,
        notes: i.note,
        attachmentUrl: i.attachment_url,
        attachmentName: i.attachment_name
      });
    });

    expenses.forEach(e => {
      const m = familyMembers.find(mem => mem.id === e.member_id || mem.name === e.member_id);
      merged.push({
        ...e,
        type: 'expense',
        category: e.expense_name,
        expense_name: e.expense_name,
        member: m ? m.name : (e.member_id || 'Family Member'),
        member_id: e.member_id,
        note: e.note,
        notes: e.note,
        receipt_url: e.receipt_url,
        attachmentUrl: e.attachment_url || e.receipt_url,
        attachmentName: e.attachment_name
      });
    });

    return merged.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  }, [income, expenses, familyMembers]);

  const activeFamilyMembers = useMemo(() => {
    return familyMembers.filter(m => m.status === 'Active' || !m.status);
  }, [familyMembers]);

  // ----------------------------------------------------
  // INDIVIDUAL SUPABASE LOADERS WITH REQUIRED CONSOLE LOGS
  // ----------------------------------------------------

  const loadMembers = useCallback(async () => {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase.from('family_members').select('*');
      if (error) {
        console.error('loadMembers error:', error);
        return [];
      }
      const list = data || [];
      console.log(`Members loaded: ${list.length}`);
      console.log(`Loaded Member Count: ${list.length}`);
      setFamilyMembers(list);
      return list;
    } catch (err) {
      console.error('loadMembers exception:', err);
      return [];
    }
  }, []);

  const loadIncome = useCallback(async () => {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase.from('income').select('*');
      if (error) {
        console.error('loadIncome error:', error);
        return [];
      }
      const list = data || [];
      console.log(`Loaded Income Count: ${list.length}`);
      setIncome(list);
      return list;
    } catch (err) {
      console.error('loadIncome exception:', err);
      return [];
    }
  }, []);

  const loadExpenses = useCallback(async () => {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) {
        console.error('loadExpenses error:', error);
        return [];
      }
      const list = data || [];
      console.log(`Loaded Expense Count: ${list.length}`);
      setExpenses(list);
      return list;
    } catch (err) {
      console.error('loadExpenses exception:', err);
      return [];
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('loadNotifications error:', error);
        return [];
      }
      const list = data || [];
      console.log(`Notifications loaded: ${list.length}`);
      console.log(`Loaded Notification Count: ${list.length}`);
      setNotifications(list);
      return list;
    } catch (err) {
      console.error('loadNotifications exception:', err);
      return [];
    }
  }, []);

  // Central Fetch Function executing all loaders immediately on startup
  const fetchSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadMembers(),
        loadIncome(),
        loadExpenses(),
        loadNotifications()
      ]);

      const { data: dbSettings } = await supabase.from('settings').select('*');
      if (dbSettings && dbSettings.length > 0) {
        const s = dbSettings[0];
        setFamilySettingsState(prev => ({
          ...prev,
          familyName: s.family_name || prev.familyName,
          currency: s.currency_symbol || prev.currency
        }));
      }
    } catch (err) {
      console.warn('fetchSupabaseData exception:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadMembers, loadIncome, loadExpenses, loadNotifications]);

  const createNotification = async (title, body, type) => {
    console.log("Calling createNotification...", { title, body, type });
    await notificationService.dispatchNotification(
      title,
      body,
      type,
      familySettings,
      loadNotifications
    );
    console.log('Notifications inserted:', { title, body, type });
  };

  const markNotificationAsRead = async (notificationId) => {
    console.log("Notification ID:", notificationId);
    if (!isSupabaseConfigured()) {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .select();

      if (error) console.error(error);
      await loadNotifications();
    } catch (err) {
      console.error("markNotificationAsRead Exception:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    console.log("Marking all notifications read in Supabase...");
    if (!isSupabaseConfigured()) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      return;
    }
    try {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false)
        .select();

      if (error) console.error(error);
      await loadNotifications();
    } catch (err) {
      console.error("Mark All Read Exception:", err);
    }
    showToast('All notifications marked as read', 'success');
  };

  const deleteNotification = async (notificationId) => {
    console.log("Notification ID:", notificationId);
    if (!isSupabaseConfigured()) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      return;
    }
    try {
      const { data, error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .select();

      if (error) console.error(error);
      await loadNotifications();
    } catch (err) {
      console.error("Delete Notification Exception:", err);
    }
    showToast('Notification deleted', 'info');
  };

  const clearAllNotifications = async () => {
    console.log("Clearing all notifications from Supabase...");
    if (!isSupabaseConfigured()) {
      setNotifications([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("notifications")
        .delete()
        .filter("id", "not.is", null)
        .select();

      if (error) console.error(error);
      await loadNotifications();
    } catch (err) {
      console.error("Clear All Exception:", err);
    }
    showToast('Cleared all notifications', 'info');
  };

  // Immediate Startup Fetch & Realtime Subscriptions for ALL tables
  useEffect(() => {
    fetchSupabaseData();

    const pollInterval = setInterval(() => {
      fetchSupabaseData();
    }, 10000);

    const channel = realtimeService.subscribeToAllTables(
      (tableName, payload) => {
        console.log('Realtime event received:', { tableName, payload });
        fetchSupabaseData();
      },
      (payload) => {
        console.log('Realtime event received for notifications:', payload);
        loadNotifications();
      }
    );

    pushNotificationService.requestPermission();
    firebaseService.initializeFirebase().then(() => {
      firebaseService.getDeviceToken();
    });

    return () => {
      clearInterval(pollInterval);
      realtimeService.unsubscribe();
    };
  }, [fetchSupabaseData, loadNotifications]);

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'info') => {
    setToastMessage({ message: msg, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // FAMILY MEMBERS CRUD (SUPABASE FIRST -> RELOAD -> CREATE NOTIFICATION)
  // ----------------------------------------------------
  const addFamilyMember = async (memberData) => {
    if (!isSupabaseConfigured()) return;
    try {
      const payload = { name: memberData.name, gender: memberData.gender };
      const { data, error: insertErr } = await supabase
        .from('family_members')
        .insert([payload])
        .select();

      if (insertErr) {
        console.error('Member insert error:', insertErr);
        showToast('Error adding family member to database', 'error');
        return;
      }

      console.log('Member inserted:', data);
      await fetchSupabaseData();
      await createNotification('Family Member Added', `New member "${memberData.name}" added to the family hub`, 'system');
      showToast(`Family member "${memberData.name}" added successfully!`, 'success');
    } catch (err) {
      console.error('addFamilyMember exception:', err);
    }
  };

  const updateFamilyMember = async (id, memberData) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error: upErr } = await supabase
        .from('family_members')
        .update(memberData)
        .eq('id', id)
        .select();

      if (upErr) {
        console.error('Member update error:', upErr);
        showToast('Error updating family member', 'error');
        return;
      }

      console.log('Member updated:', data);
      await fetchSupabaseData();
      await createNotification('Family Member Updated', `Member "${memberData.name || 'Member'}" details updated`, 'system');
      showToast('Family member updated successfully!', 'success');
    } catch (err) {
      console.error('updateFamilyMember exception:', err);
    }
  };

  const deleteFamilyMember = async (id) => {
    if (!isSupabaseConfigured()) return;
    const target = familyMembers.find(m => m.id === id);
    try {
      const { data, error: delErr } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id)
        .select();

      if (delErr) {
        console.error('Member delete error:', delErr);
        showToast('Error deleting family member', 'error');
        return;
      }

      console.log('Member deleted:', data);
      await fetchSupabaseData();
      await createNotification('Family Member Deleted', `Member "${target?.name || 'Member'}" deleted from family hub`, 'system');
      showToast('Family member deleted', 'info');
    } catch (err) {
      console.error('deleteFamilyMember exception:', err);
    }
  };

  const toggleFamilyMemberStatus = async (id) => {
    if (!isSupabaseConfigured()) return;
    const target = familyMembers.find(m => m.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';

    try {
      const { data, error: statusErr } = await supabase
        .from('family_members')
        .update({ status: nextStatus })
        .eq('id', id)
        .select();

      if (statusErr) {
        console.error('Toggle member status error:', statusErr);
        showToast('Error updating member status', 'error');
        return;
      }

      console.log('Member status updated:', data);
      await fetchSupabaseData();
      await createNotification(
        nextStatus === 'Active' ? 'Family Member Activated' : 'Family Member Deactivated',
        `Member "${target.name}" marked as ${nextStatus}`,
        'system'
      );
      showToast(`Member "${target.name}" marked as ${nextStatus}`, 'info');
    } catch (err) {
      console.error('toggleFamilyMemberStatus exception:', err);
    }
  };

  // ----------------------------------------------------
  // INCOME CRUD (SUPABASE FIRST -> RELOAD -> CREATE NOTIFICATION)
  // ----------------------------------------------------
  const addIncome = async (incomeData) => {
    const formattedAmt = formatIndianNumber(incomeData.amount);
    console.log("Adding Income...", incomeData);

    const memberObj = familyMembers.find(m => m.name === incomeData.member || m.id === incomeData.member);
    const memberUUID = memberObj ? memberObj.id : null;
    const memberName = memberObj ? memberObj.name : (incomeData.member || 'Family Member');

    if (isSupabaseConfigured()) {
      try {
        const fullPayload = {
          amount: Number(incomeData.amount),
          source: incomeData.source,
          member_id: memberUUID,
          date: incomeData.date || new Date().toISOString().split('T')[0],
          note: incomeData.notes || incomeData.note || null
        };

        if (incomeData.attachmentUrl) fullPayload.attachment_url = incomeData.attachmentUrl;
        if (incomeData.attachmentName) fullPayload.attachment_name = incomeData.attachmentName;

        const { data: incData, error: incError } = await supabase
          .from('income')
          .insert([fullPayload])
          .select();

        if (incError) {
          console.error('Income Insert Error:', incError);
          showToast('Error saving income to database', 'error');
          return;
        }

        console.log('Income inserted:', incData);
        await fetchSupabaseData();

        const notifBody = `${memberName} added ${familySettings.currency}${formattedAmt} (${incomeData.source})`;
        await createNotification('Income Added', notifBody, 'income');
        showToast(`Income of ${familySettings.currency}${formattedAmt} added!`, 'success');
      } catch (err) {
        console.error('Income insert exception:', err);
      }
    }
  };

  // ----------------------------------------------------
  // EXPENSE CRUD (SUPABASE FIRST -> RELOAD -> CREATE NOTIFICATION)
  // ----------------------------------------------------
  const addExpense = async (expenseData) => {
    const formattedAmt = formatIndianNumber(expenseData.amount);
    console.log("Adding Expense...", expenseData);

    const memberObj = familyMembers.find(m => m.name === expenseData.member || m.id === expenseData.member);
    const memberUUID = memberObj ? memberObj.id : null;
    const memberName = memberObj ? memberObj.name : (expenseData.member || 'Family Member');
    const expName = expenseData.category || expenseData.expense_name || 'General Expense';

    if (isSupabaseConfigured()) {
      try {
        const fullPayload = {
          amount: Number(expenseData.amount),
          expense_name: expName,
          member_id: memberUUID,
          date: expenseData.date || new Date().toISOString().split('T')[0],
          note: expenseData.notes || expenseData.note || null
        };

        if (expenseData.attachmentUrl) {
          fullPayload.attachment_url = expenseData.attachmentUrl;
          fullPayload.receipt_url = expenseData.attachmentUrl;
        }
        if (expenseData.attachmentName) {
          fullPayload.attachment_name = expenseData.attachmentName;
        }

        const { data: expData, error: expError } = await supabase
          .from('expenses')
          .insert([fullPayload])
          .select();

        if (expError) {
          console.error('Expense Insert Error:', expError);
          showToast('Error saving expense to database', 'error');
          return;
        }

        console.log('Expense inserted:', expData);
        await fetchSupabaseData();

        const notifBody = `${memberName} spent ${familySettings.currency}${formattedAmt} (${expName})`;
        await createNotification('Expense Added', notifBody, 'expense');

        if (expenseData.attachmentUrl) {
          await createNotification(
            'Receipt Uploaded',
            `Proof attached for ${expName} by ${memberName}`,
            'receipt'
          );
        }

        showToast(`Expense of ${familySettings.currency}${formattedAmt} added!`, 'success');
      } catch (err) {
        console.error('Expense insert exception:', err);
      }
    }
  };

  // EDIT TRANSACTION (INCOME / EXPENSE)
  const updateTransaction = async (id, updatedData) => {
    const target = transactions.find(t => t.id === id);
    console.log("Updating Transaction...", { id, updatedData });

    const isInc = target ? target.type === 'income' : true;
    const memberObj = familyMembers.find(m => m.name === (updatedData.member || target?.member) || m.id === (updatedData.member || target?.member));
    const memberUUID = memberObj ? memberObj.id : (target?.member_id || null);
    const memberName = memberObj ? memberObj.name : (updatedData.member || target?.member || 'Family Member');
    const expName = updatedData.category || updatedData.expense_name || target?.category || target?.expense_name;

    if (target && isSupabaseConfigured()) {
      const formattedAmt = formatIndianNumber(updatedData.amount || target.amount);

      try {
        const table = isInc ? 'income' : 'expenses';
        const payload = isInc ? {
          amount: Number(updatedData.amount || target.amount),
          source: updatedData.source || target.source,
          member_id: memberUUID,
          note: updatedData.notes || updatedData.note || target.notes || target.note || null
        } : {
          amount: Number(updatedData.amount || target.amount),
          expense_name: expName,
          member_id: memberUUID,
          note: updatedData.notes || updatedData.note || target.notes || target.note || null
        };

        if (updatedData.attachmentUrl) {
          payload.attachment_url = updatedData.attachmentUrl;
          if (!isInc) payload.receipt_url = updatedData.attachmentUrl;
        }
        if (updatedData.attachmentName) {
          payload.attachment_name = updatedData.attachmentName;
        }

        const { data: upData, error: upError } = await supabase
          .from(table)
          .update(payload)
          .eq('id', target.id)
          .select();

        if (upError) {
          console.error(`${table} update error:`, upError);
          showToast('Error updating transaction in database', 'error');
          return;
        }

        console.log(`${table} updated:`, upData);
        await fetchSupabaseData();

        const notifBody = `${memberName} updated ${isInc ? 'income' : 'expense'} to ${familySettings.currency}${formattedAmt}`;
        await createNotification(
          isInc ? 'Income Updated' : 'Expense Updated',
          notifBody,
          'edit'
        );
        showToast('Transaction updated successfully!', 'success');
      } catch (err) {
        console.error('Update transaction exception:', err);
      }
    }
  };

  // DELETE TRANSACTION (INCOME / EXPENSE)
  const deleteTransaction = async (id) => {
    const target = transactions.find(t => t.id === id);
    console.log("Deleting Transaction...", id);

    if (target && isSupabaseConfigured()) {
      const isInc = target.type === 'income';
      const formattedAmt = formatIndianNumber(target.amount);

      try {
        const table = isInc ? 'income' : 'expenses';
        const { data: delData, error: delError } = await supabase
          .from(table)
          .delete()
          .eq('id', target.id)
          .select();

        if (delError) {
          console.error(`${table} delete error:`, delError);
          showToast('Error deleting transaction from database', 'error');
          return;
        }

        console.log(`${table} deleted:`, delData);
        await fetchSupabaseData();

        const notifBody = `${isInc ? 'Income' : 'Expense'} record of ${familySettings.currency}${formattedAmt} (${isInc ? target.source : (target.category || target.expense_name)}) deleted`;
        await createNotification(
          isInc ? 'Income Deleted' : 'Expense Deleted',
          notifBody,
          'delete'
        );
        showToast('Transaction record deleted', 'info');
      } catch (err) {
        console.error('Delete transaction exception:', err);
      }
    }
  };

  // Trigger Monthly Summary Notification
  const triggerMonthlySummaryNotification = async () => {
    await notificationService.generateMonthlySummaryNotification(
      totalIncome,
      totalExpense,
      currentBalance,
      familySettings,
      loadNotifications
    );
    showToast('Monthly summary notification generated!', 'success');
  };

  const exportBackupJSON = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      familySettings,
      familyMembers,
      income,
      expenses,
      transactions,
      notifications
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `Family_Finance_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('JSON Backup downloaded!', 'success');

    createNotification('Backup Generated', `JSON Backup generated on ${new Date().toLocaleDateString('en-IN')}`, 'backup');
  };

  const importBackupJSON = (jsonObj) => {
    try {
      if (jsonObj.income || jsonObj.expenses || jsonObj.transactions) {
        if (jsonObj.income) setIncome(jsonObj.income);
        if (jsonObj.expenses) setExpenses(jsonObj.expenses);
        if (jsonObj.familyMembers) setFamilyMembers(jsonObj.familyMembers);
        if (jsonObj.notifications) setNotifications(jsonObj.notifications);
        showToast('Backup restored successfully!', 'success');
      } else {
        showToast('Invalid backup file format', 'error');
      }
    } catch (e) {
      showToast('Error restoring backup file', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        adminProfile,
        currentPath,
        navigate,
        isAdminAuthenticated,
        authSession,
        quickUnlockSettings,
        isQuickUnlocked,
        verifyQuickPin,
        setupQuickUnlock,
        showSetupQuickUnlockModal,
        setShowSetupQuickUnlockModal,
        loginAdmin,
        logoutAdmin,
        familySettings,
        setFamilySettings,
        familyMembers,
        activeFamilyMembers,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        toggleFamilyMemberStatus,
        incomeSources: INITIAL_INCOME_SOURCES,
        income,
        expenses,
        transactions,
        notifications,
        loadMembers,
        loadIncome,
        loadExpenses,
        loadNotifications,
        fetchSupabaseData,
        loading,
        error,
        createNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        triggerMonthlySummaryNotification,
        receiptModalUrl,
        setReceiptModalUrl,
        receiptModalTitle,
        setReceiptModalTitle,
        toastMessage,
        showToast,
        totalIncome,
        totalExpense,
        currentBalance,
        addIncome,
        addExpense,
        updateTransaction,
        deleteTransaction,
        exportBackupJSON,
        importBackupJSON
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
