import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  LogOut,
  Settings,
  LayoutDashboard,
  Receipt,
  BarChart3,
  Upload,
  ArrowRight,
  X,
  Users,
  UserPlus,
  UploadCloud,
  Paperclip,
  FileCheck,
  Mail,
  Lock,
  KeyRound,
  Fingerprint
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { formatIndianNumber, parseRawNumericValue } from '../utils/numberFormat';
import { formatDisplayDate } from '../utils/dateFormat';
import { motion } from 'framer-motion';

// --- ADMIN PRIMARY LOGIN SCREEN ---
const AdminPrimaryLoginScreen = ({ onSwitchToPassword }) => {
  const { loginAdmin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await loginAdmin(email, password);
    setLoading(false);
    if (!success) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#FFFFFF] border border-[#E5E7EB] rounded-[24px] p-6 sm:p-8 shadow-2xl text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#2E7D32] border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="px-3 py-1 bg-emerald-50 text-[#2E7D32] text-[11px] font-bold rounded-full uppercase tracking-wider">
            Admin Authentication
          </span>
          <h2 className="text-2xl font-extrabold text-[#111827] pt-1">
            Admin Sign In
          </h2>
          <p className="text-xs text-[#6B7280]">
            Enter your admin email and password to access household finances.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">
              Admin Email Address *
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3.5 text-[#6B7280]" />
              <input
                type="email"
                required
                placeholder="admin@family.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full h-[44px] pl-10 pr-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">
              Password *
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-[#6B7280]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full h-[44px] pl-10 pr-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-[#EF4444] bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- QUICK UNLOCK SCREEN ---
const QuickUnlockScreen = ({ onSwitchToPassword }) => {
  const { verifyQuickPin } = useApp();
  const [pin, setPin] = useState('');

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    const success = await verifyQuickPin(pin);
    if (!success) {
      setPin('');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#FFFFFF] border border-[#E5E7EB] rounded-[24px] p-6 sm:p-8 shadow-2xl text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#2E7D32] border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
          <KeyRound className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="px-3 py-1 bg-emerald-50 text-[#2E7D32] text-[11px] font-bold rounded-full uppercase tracking-wider">
            Quick Unlock
          </span>
          <h2 className="text-2xl font-extrabold text-[#111827] pt-1">
            Enter Quick PIN
          </h2>
          <p className="text-xs text-[#6B7280]">
            Enter your 4-digit Quick Unlock PIN to continue.
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-5 text-left pt-2">
          <div>
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-mono font-bold transition-all ${
                    pin.length > idx
                      ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32]'
                      : 'border-[#D1D5DB] bg-[#F8FAFC]'
                  }`}
                >
                  {pin.length > idx ? '•' : ''}
                </div>
              ))}
            </div>

            <input
              type="password"
              maxLength={4}
              autoFocus
              value={pin}
              onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="sr-only"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((num, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (num === 'C') {
                    setPin('');
                  } else if (num === '✓') {
                    if (pin.length === 4) verifyQuickPin(pin);
                  } else {
                    if (pin.length < 4) setPin(prev => prev + num);
                  }
                }}
                className="h-11 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-emerald-50 hover:border-[#2E7D32] text-sm font-bold text-[#111827] flex items-center justify-center transition active:scale-95"
              >
                {num}
              </button>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onSwitchToPassword}
              className="text-xs font-bold text-[#2E7D32] hover:underline"
            >
              Use Password Instead
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- SETUP QUICK UNLOCK MODAL ---
const SetupQuickUnlockModal = () => {
  const { setupQuickUnlock, setShowSetupQuickUnlockModal } = useApp();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    setupQuickUnlock(pin, fingerprintEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-4 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center mx-auto border border-emerald-100">
          <KeyRound className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-[#111827]">
            Enable Quick Unlock
          </h3>
          <p className="text-xs text-[#6B7280]">
            Set a 4-digit Quick PIN to quickly unlock the Admin Dashboard on future visits.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">Create 4-Digit PIN *</label>
            <input
              type="password"
              maxLength={4}
              required
              placeholder="••••"
              value={pin}
              onChange={e => {
                setPin(e.target.value.replace(/[^0-9]/g, ''));
                setError('');
              }}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-center text-lg font-mono font-bold tracking-widest text-[#111827]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">Confirm 4-Digit PIN *</label>
            <input
              type="password"
              maxLength={4}
              required
              placeholder="••••"
              value={confirmPin}
              onChange={e => {
                setConfirmPin(e.target.value.replace(/[^0-9]/g, ''));
                setError('');
              }}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-center text-lg font-mono font-bold tracking-widest text-[#111827]"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] cursor-pointer">
            <input
              type="checkbox"
              checked={fingerprintEnabled}
              onChange={e => setFingerprintEnabled(e.target.checked)}
              className="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]"
            />
            <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
              <Fingerprint className="w-4 h-4 text-[#2E7D32]" />
              <span>Enable Fingerprint / Biometric Unlock</span>
            </div>
          </label>

          {error && <p className="text-xs font-bold text-[#EF4444] text-center">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSetupQuickUnlockModal(false)}
              className="flex-1 h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-bold text-xs"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="flex-1 h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs shadow-md transition"
            >
              Enable Quick Unlock
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- MAIN ADMIN PANEL ---
export const AdminPanel = () => {
  const {
    isAdminAuthenticated,
    isQuickUnlocked,
    quickUnlockSettings,
    showSetupQuickUnlockModal,
    logoutAdmin,
    familySettings,
    setFamilySettings,
    familyMembers,
    activeFamilyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    toggleFamilyMemberStatus,
    currentBalance,
    totalIncome,
    totalExpense,
    transactions,
    incomeSources,
    addIncome,
    addExpense,
    updateTransaction,
    deleteTransaction,
    exportBackupJSON,
    importBackupJSON,
    setReceiptModalUrl,
    setReceiptModalTitle,
    showToast
  } = useApp();

  const [adminTab, setAdminTab] = useState('dashboard');
  const [forcePasswordView, setForcePasswordView] = useState(false);

  // Modals & Form States for Transactions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('income');
  const [editingTx, setEditingTx] = useState(null);

  const [formAmount, setFormAmount] = useState('');
  const [formMember, setFormMember] = useState('');
  const [formSourceOrCategory, setFormSourceOrCategory] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Receipt Upload Form State
  const [formAttachmentUrl, setFormAttachmentUrl] = useState(null);
  const [formAttachmentName, setFormAttachmentName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Family Member Management Modal Form State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberNameInput, setMemberNameInput] = useState('');
  const [memberGenderInput, setMemberGenderInput] = useState('Male');
  const [memberStatusInput, setMemberStatusInput] = useState('Active');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');

  if (!isAdminAuthenticated || forcePasswordView) {
    return <AdminPrimaryLoginScreen onSwitchToPassword={() => setForcePasswordView(false)} />;
  }

  if (quickUnlockSettings.enabled && !isQuickUnlocked && (quickUnlockSettings.failedAttempts || 0) < 5) {
    return <QuickUnlockScreen onSwitchToPassword={() => setForcePasswordView(true)} />;
  }

  // File Upload Processing
  const processUploadedFile = (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      showToast('Unsupported file type. Please upload JPG, PNG, or PDF', 'warning');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('File size exceeds 10MB limit', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormAttachmentUrl(e.target.result);
      setFormAttachmentName(file.name);
      showToast(`Receipt file "${file.name}" attached!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Open Transaction Modal Helpers
  const handleOpenAdd = (type) => {
    setEditingTx(null);
    setModalType(type);
    setFormAmount('');
    setFormMember(activeFamilyMembers[0]?.name || '');
    setFormSourceOrCategory(type === 'income' ? '💼 Salary' : '');
    setFormNotes('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAttachmentUrl(null);
    setFormAttachmentName(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    setModalType(tx.type);
    setFormAmount(formatIndianNumber(tx.amount));
    setFormMember(tx.member || '');
    setFormSourceOrCategory(tx.type === 'income' ? tx.source : tx.category);
    setFormNotes(tx.notes || '');
    setFormDate(tx.date || new Date().toISOString().split('T')[0]);
    setFormAttachmentUrl(tx.attachmentUrl || null);
    setFormAttachmentName(tx.attachmentName || null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const rawAmount = parseRawNumericValue(formAmount);
    if (!rawAmount || rawAmount <= 0) {
      showToast('Please enter a valid amount greater than 0', 'warning');
      return;
    }

    if (!formMember) {
      showToast('Please select an active Family Member', 'warning');
      return;
    }

    if (!formSourceOrCategory.trim()) {
      showToast(modalType === 'income' ? 'Please select an Income Source' : 'Please enter Expense Name', 'warning');
      return;
    }

    if (modalType === 'income') {
      const payload = {
        amount: rawAmount,
        member: formMember,
        source: formSourceOrCategory || '💼 Salary',
        notes: formNotes,
        date: formDate,
        attachmentUrl: formAttachmentUrl,
        attachmentName: formAttachmentName
      };
      if (editingTx) {
        updateTransaction(editingTx.id, payload);
      } else {
        addIncome(payload);
      }
    } else {
      const payload = {
        amount: rawAmount,
        member: formMember,
        category: formSourceOrCategory.trim(),
        notes: formNotes,
        date: formDate,
        attachmentUrl: formAttachmentUrl,
        attachmentName: formAttachmentName
      };
      if (editingTx) {
        updateTransaction(editingTx.id, payload);
      } else {
        addExpense(payload);
      }
    }

    setIsModalOpen(false);
  };

  // Open Family Member Modal Helpers
  const handleOpenMemberAdd = () => {
    setEditingMember(null);
    setMemberNameInput('');
    setMemberGenderInput('Male');
    setMemberStatusInput('Active');
    setIsMemberModalOpen(true);
  };

  const handleOpenMemberEdit = (m) => {
    setEditingMember(m);
    setMemberNameInput(m.name);
    setMemberGenderInput(m.gender || 'Male');
    setMemberStatusInput(m.status || 'Active');
    setIsMemberModalOpen(true);
  };

  const handleMemberFormSubmit = (e) => {
    e.preventDefault();
    if (!memberNameInput.trim()) return;

    if (editingMember) {
      updateFamilyMember(editingMember.id, {
        name: memberNameInput.trim(),
        gender: memberGenderInput,
        status: memberStatusInput
      });
    } else {
      addFamilyMember({
        name: memberNameInput.trim(),
        gender: memberGenderInput,
        status: memberStatusInput
      });
    }

    setIsMemberModalOpen(false);
  };

  // Filtered Transactions
  const filteredTransactions = transactions.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      t.amount.toString().includes(query) ||
      (t.category || '').toLowerCase().includes(query) ||
      (t.source || '').toLowerCase().includes(query) ||
      (t.member || '').toLowerCase().includes(query) ||
      (t.notes || '').toLowerCase().includes(query);

    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesMember = memberFilter === 'all' || t.member === memberFilter;

    return matchesSearch && matchesType && matchesMember;
  });

  const incomeList = transactions.filter(t => t.type === 'income');
  const expenseList = transactions.filter(t => t.type === 'expense');

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Admin Header Bar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[20px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center font-extrabold shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#111827]">
                Admin Management Panel
              </h1>
              <span className="px-2 py-0.5 bg-[#2E7D32] text-white text-[10px] font-bold rounded-md uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Full CRUD access to manage family members, incomes, expenses, receipts, reports, and settings.
            </p>
          </div>
        </div>

        <button
          onClick={logoutAdmin}
          className="px-4 py-2 rounded-xl bg-rose-50 text-[#EF4444] border border-rose-100 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Logout Admin
        </button>
      </div>

      {/* Admin Tab Navigation (NO NOTIFICATION TAB OR UI) */}
      <div className="flex bg-[#FFFFFF] border border-[#E5E7EB] p-1.5 rounded-[16px] shadow-xs gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'income', label: 'Income', icon: ArrowDownRight },
          { id: 'expense', label: 'Expenses', icon: ArrowUpRight },
          { id: 'transactions', label: 'Transactions', icon: Receipt },
          { id: 'members', label: 'Family Members', icon: Users },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0 transition-all ${
                isActive
                  ? 'bg-[#2E7D32] text-white shadow-xs font-extrabold'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. ADMIN DASHBOARD */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Current Balance</span>
              <div className="text-3xl font-black text-[#111827]">
                {familySettings.currency}{formatIndianNumber(currentBalance)}
              </div>
              <span className="text-[11px] font-semibold text-[#2E7D32] block">
                Auto-calculated (Income − Expense)
              </span>
            </div>

            <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Income</span>
              <div className="text-3xl font-black text-[#22C55E]">
                {familySettings.currency}{formatIndianNumber(totalIncome)}
              </div>
              <button
                onClick={() => handleOpenAdd('income')}
                className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#2E7D32] hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Income
              </button>
            </div>

            <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Expenses</span>
              <div className="text-3xl font-black text-[#EF4444]">
                {familySettings.currency}{formatIndianNumber(totalExpense)}
              </div>
              <button
                onClick={() => handleOpenAdd('expense')}
                className="mt-2 px-3 py-1.5 rounded-xl bg-rose-50 text-[#EF4444] hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FAMILY MEMBERS MODULE */}
      {adminTab === 'members' && (
        <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Family Members Management ({familyMembers.length})</h2>
              <p className="text-xs text-[#6B7280]">Add, edit, delete, and toggle Active/Inactive status for family members</p>
            </div>
            <button
              onClick={handleOpenMemberAdd}
              className="h-[44px] px-4 rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> + Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {familyMembers.map(m => {
              const isActive = m.status === 'Active';
              const icon = m.gender === 'Female' ? '👩' : '👨';
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-[#F8FAFC] border-[#E5E7EB]'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-xl shadow-xs">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                        {m.name}
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-emerald-50 text-[#2E7D32] border border-emerald-100'
                            : 'bg-rose-50 text-[#EF4444] border border-rose-100'
                        }`}>
                          {m.status}
                        </span>
                      </h4>
                      <span className="text-xs text-[#6B7280]">Gender: {m.gender}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFamilyMemberStatus(m.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isActive
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-emerald-50 text-[#2E7D32] hover:bg-emerald-100'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleOpenMemberEdit(m)}
                      className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-white rounded-xl transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteFamilyMember(m.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. INCOME MODULE */}
      {adminTab === 'income' && (
        <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Income Records ({incomeList.length})</h2>
              <p className="text-xs text-[#6B7280]">Add, edit, and delete household income records</p>
            </div>
            <button
              onClick={() => handleOpenAdd('income')}
              className="h-[44px] px-4 rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> + Add Income
            </button>
          </div>

          <div className="space-y-2.5 pt-2">
            {incomeList.map(t => (
              <div key={t.id} className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                    {t.source}
                    {t.member && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#2E7D32]">
                        {t.member}
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-[#6B7280]">{t.notes || 'Income record'} &bull; {formatDisplayDate(t.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-[#22C55E]">
                    +{familySettings.currency}{formatIndianNumber(t.amount)}
                  </span>
                  <button onClick={() => handleOpenEdit(t)} className="p-1.5 text-[#6B7280] hover:text-[#111827]">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. EXPENSE MODULE */}
      {adminTab === 'expense' && (
        <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Expense Records ({expenseList.length})</h2>
              <p className="text-xs text-[#6B7280]">Add, edit, and delete household expenses</p>
            </div>
            <button
              onClick={() => handleOpenAdd('expense')}
              className="h-[44px] px-4 rounded-[14px] bg-[#EF4444] hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> + Add Expense
            </button>
          </div>

          <div className="space-y-2.5 pt-2">
            {expenseList.map(t => (
              <div key={t.id} className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                    {t.category}
                    {t.member && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                        {t.member}
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-[#6B7280]">{t.notes || 'Expense payment'} &bull; {formatDisplayDate(t.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {t.attachmentUrl && (
                    <button
                      onClick={() => {
                        setReceiptModalUrl(t.attachmentUrl);
                        setReceiptModalTitle(t.attachmentName || 'Receipt');
                      }}
                      className="p-1.5 rounded-lg bg-emerald-50 text-[#2E7D32]"
                      title="View Receipt"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-base font-extrabold text-[#EF4444]">
                    -{familySettings.currency}{formatIndianNumber(t.amount)}
                  </span>
                  <button onClick={() => handleOpenEdit(t)} className="p-1.5 text-[#6B7280] hover:text-[#111827]">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TRANSACTIONS MODULE */}
      {adminTab === 'transactions' && (
        <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">All Transactions ({filteredTransactions.length})</h2>
              <p className="text-xs text-[#6B7280]">Search, filter by family member, edit, and delete all records</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleOpenAdd('income')} className="h-[40px] px-3 bg-emerald-50 text-[#2E7D32] text-xs font-bold rounded-[12px]">
                + Income
              </button>
              <button onClick={() => handleOpenAdd('expense')} className="h-[40px] px-3 bg-rose-50 text-[#EF4444] text-xs font-bold rounded-[12px]">
                + Expense
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search amount, expense name, member, notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-[44px] pl-10 pr-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold text-[#111827]"
              />
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
              >
                <option value="all">All Transaction Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>

            <div>
              <select
                value={memberFilter}
                onChange={e => setMemberFilter(e.target.value)}
                className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
              >
                <option value="all">Filter by Family Member (All)</option>
                {familyMembers.map(m => (
                  <option key={m.id} value={m.name}>
                    {m.gender === 'Female' ? '👩' : '👨'} {m.name} {m.status === 'Inactive' ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {filteredTransactions.map(t => {
              const isIncome = t.type === 'income';
              return (
                <div key={t.id} className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                      {isIncome ? t.source : t.category}
                      {t.member && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#2E7D32] border border-emerald-100">
                          {t.member}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-[#6B7280]">{t.notes || 'Record'} &bull; {formatDisplayDate(t.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.attachmentUrl && (
                      <button
                        onClick={() => {
                          setReceiptModalUrl(t.attachmentUrl);
                          setReceiptModalTitle(t.attachmentName || 'Receipt');
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 text-[#2E7D32]"
                        title="View Receipt Attachment"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                    )}
                    <span className={`text-base font-extrabold ${isIncome ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {isIncome ? '+' : '-'}{familySettings.currency}{formatIndianNumber(t.amount)}
                    </span>
                    <button onClick={() => handleOpenEdit(t)} className="p-1.5 text-[#6B7280] hover:text-[#111827]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. REPORTS MODULE */}
      {adminTab === 'reports' && (
        <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Reports & Statements</h2>
              <p className="text-xs text-[#6B7280]">Download statement exports with family member breakdowns</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  exportToPDF(transactions, familySettings.currency);
                  showToast('Exported PDF report!', 'success');
                }}
                className="h-[44px] px-4 rounded-[14px] bg-rose-50 text-[#EF4444] border border-rose-100 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> Export PDF
              </button>

              <button
                onClick={() => {
                  exportToExcel(transactions);
                  showToast('Exported Excel file!', 'success');
                }}
                className="h-[44px] px-4 rounded-[14px] bg-emerald-50 text-[#2E7D32] border border-emerald-100 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-[#6B7280] uppercase block mb-1">Total Income</span>
              <span className="text-lg font-extrabold text-[#22C55E]">
                {familySettings.currency}{formatIndianNumber(totalIncome)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-[#6B7280] uppercase block mb-1">Total Expenses</span>
              <span className="text-lg font-extrabold text-[#EF4444]">
                {familySettings.currency}{formatIndianNumber(totalExpense)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <span className="text-[#6B7280] uppercase block mb-1">Net Balance</span>
              <span className="text-lg font-extrabold text-[#111827]">
                {familySettings.currency}{formatIndianNumber(currentBalance)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. SETTINGS MODULE */}
      {adminTab === 'settings' && (
        <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">Settings & Data Backup</h2>
            <p className="text-xs text-[#6B7280]">Update family title, currency, and backup database</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">Family Title</label>
              <input
                type="text"
                value={familySettings.familyName}
                onChange={e => setFamilySettings({ ...familySettings, familyName: e.target.value })}
                className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">Currency Symbol</label>
              <input
                type="text"
                value={familySettings.currency}
                onChange={e => setFamilySettings({ ...familySettings, currency: e.target.value })}
                className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
            <h3 className="font-bold text-sm text-[#111827]">Database Backup & Restore</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={exportBackupJSON}
                className="h-[44px] flex items-center justify-center gap-2 px-4 bg-emerald-50 text-[#2E7D32] hover:bg-emerald-100 rounded-[14px] text-xs font-bold transition"
              >
                <Download className="w-4 h-4" /> Download JSON Backup
              </button>

              <label className="h-[44px] flex items-center justify-center gap-2 px-4 bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/40 rounded-[14px] text-xs font-bold text-[#111827] transition cursor-pointer">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Restore JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const parsed = JSON.parse(event.target.result);
                          importBackupJSON(parsed);
                        } catch(err) {
                          showToast('Invalid JSON file format', 'error');
                        }
                      };
                      reader.readAsText(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SETUP QUICK UNLOCK MODAL PROMPT */}
      {showSetupQuickUnlockModal && <SetupQuickUnlockModal />}

      {/* ADD / EDIT TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#111827]">
                {editingTx ? `Edit ${modalType === 'income' ? 'Income' : 'Expense'}` : `Add New ${modalType === 'income' ? 'Income' : 'Expense'}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#6B7280] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Amount ({familySettings.currency}) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-base font-bold text-[#2E7D32]">
                    {familySettings.currency}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="10,000"
                    value={formAmount}
                    onChange={e => setFormAmount(formatIndianNumber(e.target.value))}
                    className="w-full h-[44px] pl-8 pr-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-base font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1">
                  Family Member <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  required
                  value={formMember}
                  onChange={e => setFormMember(e.target.value)}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#2E7D32] rounded-[14px] text-xs font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
                >
                  <option value="" disabled>Select Family Member</option>
                  {activeFamilyMembers.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.gender === 'Female' ? '👩' : '👨'} {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                {modalType === 'income' ? (
                  <>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                      Income Source *
                    </label>
                    <select
                      value={formSourceOrCategory}
                      onChange={e => setFormSourceOrCategory(e.target.value)}
                      className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                    >
                      {incomeSources.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      Expense Name <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grocery, House Rent, Fuel, Electricity Bill, Medical, School Fees"
                      value={formSourceOrCategory}
                      onChange={e => setFormSourceOrCategory(e.target.value)}
                      className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Additional details"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1">
                  Receipt / Proof (Optional)
                </label>

                {formAttachmentUrl ? (
                  <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {formAttachmentUrl.startsWith('data:image/') || formAttachmentUrl.match(/\.(jpeg|jpg|png)$/i) ? (
                        <img
                          src={formAttachmentUrl}
                          alt="Receipt Preview"
                          className="w-10 h-10 object-cover rounded-xl border border-emerald-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111827] truncate">
                          {formAttachmentName || 'Receipt Document'}
                        </p>
                        <span className="text-[10px] text-[#2E7D32] font-semibold">
                          Receipt attached (Max 10MB)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFormAttachmentUrl(null);
                        setFormAttachmentName(null);
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 text-[#EF4444] hover:bg-rose-100 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processUploadedFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-[16px] cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#2E7D32] bg-emerald-50/50'
                        : 'border-[#D1D5DB] hover:border-[#2E7D32] bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] text-[#2E7D32] flex items-center justify-center shadow-xs mb-1.5">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#111827]">
                      Tap to upload receipt or bill
                    </span>
                    <span className="text-[10px] text-[#6B7280] mt-0.5">
                      Supports JPG, PNG, PDF (Max 10MB)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processUploadedFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs shadow-md transition"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT FAMILY MEMBER MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#111827]">
                {editingMember ? 'Edit Family Member' : 'Add Family Member'}
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="p-1 text-[#6B7280] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMemberFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bava / Moolu"
                  value={memberNameInput}
                  onChange={e => setMemberNameInput(e.target.value)}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Gender *</label>
                  <select
                    value={memberGenderInput}
                    onChange={e => setMemberGenderInput(e.target.value)}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                  >
                    <option value="Male">👨 Male</option>
                    <option value="Female">👩 Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Status *</label>
                  <select
                    value={memberStatusInput}
                    onChange={e => setMemberStatusInput(e.target.value)}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="flex-1 h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs shadow-md transition"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
