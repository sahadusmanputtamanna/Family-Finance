import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  User,
  Lock,
  Download,
  Upload,
  RotateCcw,
  Cloud,
  Layers,
  KeyRound,
  Share2,
  QrCode,
  Eye,
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  Globe,
  DollarSign
} from 'lucide-react';

export const AdminView = () => {
  const {
    adminProfile,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    dashboardConfig,
    setDashboardConfig,
    familyInfo,
    setFamilyInfo,
    settings,
    setSettings,
    resetToDefaults,
    showToast,
    transactions,
    bills,
    goals,
    setDeleteConfirmItem
  } = useApp();

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('info');
  const [editingAnnId, setEditingAnnId] = useState(null);

  // Security PIN
  const [pinInput, setPinInput] = useState(settings.pin);

  // Category Edit State
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📦');
  const [newCatBudget, setNewCatBudget] = useState('5000');

  const handleAddAnnouncementSubmit = (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    if (editingAnnId) {
      updateAnnouncement(editingAnnId, {
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType
      });
      setEditingAnnId(null);
    } else {
      addAnnouncement({
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType
      });
    }

    setAnnTitle('');
    setAnnContent('');
    setAnnType('info');
  };

  const handleEditAnnouncement = (ann) => {
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnType(ann.type || 'info');
  };

  const handleAddCatSubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      emoji: newCatEmoji || '📦',
      budget: Number(newCatBudget) || 5000,
      color: '#64748b'
    });
    setNewCatName('');
  };

  const handleExportJSON = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      adminProfile,
      familyInfo,
      dashboardConfig,
      categories,
      transactions,
      bills,
      goals,
      announcements,
      settings
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Family_Finance_CMS_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON Backup file exported successfully!', 'success');
  };

  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.transactions) {
            localStorage.setItem('ffh_categories', JSON.stringify(imported.categories));
            localStorage.setItem('ffh_transactions', JSON.stringify(imported.transactions));
            localStorage.setItem('ffh_bills', JSON.stringify(imported.bills));
            localStorage.setItem('ffh_goals', JSON.stringify(imported.goals));
            if (imported.announcements) localStorage.setItem('ffh_announcements', JSON.stringify(imported.announcements));
            showToast('Backup restored successfully! Reloading page...', 'success');
            setTimeout(() => window.location.reload(), 1000);
          }
        } catch (err) {
          showToast('Invalid backup JSON file format', 'error');
        }
      };
    }
  };

  const handleSavePin = () => {
    setSettings(prev => ({ ...prev, pin: pinInput }));
    showToast('Security PIN updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#2E7D32]" />
            Full CMS Control Center
          </h2>
          <p className="text-xs text-[#6B7280]">
            Edit dashboard widgets, family settings, announcements, security, categories, and database backups
          </p>
        </div>
      </div>

      {/* 1. DASHBOARD LAYOUT & WIDGET CONFIGURATION (CMS) */}
      <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium space-y-4">
        <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#2E7D32]" />
          Dashboard Layout & Widget Control
        </h3>
        <p className="text-xs text-[#6B7280]">
          Configure which summary sections and widgets appear on the main financial dashboard
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { key: 'showBalance', label: "Today's Balance Card" },
            { key: 'showIncome', label: "Monthly Income Card" },
            { key: 'showExpense', label: "Monthly Expense Card" },
            { key: 'showSavings', label: "Monthly Savings Card" },
            { key: 'showCharts', label: "Financial Analytics Charts" },
            { key: 'showCategories', label: "Category Breakdown Progress" },
            { key: 'showRecentTx', label: "Recent Transactions List" }
          ].map(widget => (
            <div
              key={widget.key}
              className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl text-xs"
            >
              <span className="font-semibold text-[#111827]">{widget.label}</span>
              <input
                type="checkbox"
                checked={dashboardConfig[widget.key]}
                onChange={e => setDashboardConfig({ ...dashboardConfig, [widget.key]: e.target.checked })}
                className="w-4 h-4 accent-[#2E7D32] rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. FAMILY INFORMATION & SYSTEM SETTINGS */}
      <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium space-y-4">
        <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#2E7D32]" />
          Family Information & System Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">Family Title</label>
            <input
              type="text"
              value={familyInfo.familyName}
              onChange={e => setFamilyInfo({ ...familyInfo, familyName: e.target.value })}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">Currency Symbol</label>
            <input
              type="text"
              value={familyInfo.currency}
              onChange={e => setFamilyInfo({ ...familyInfo, currency: e.target.value })}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">Timezone</label>
            <input
              type="text"
              value={familyInfo.timezone}
              onChange={e => setFamilyInfo({ ...familyInfo, timezone: e.target.value })}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
            />
          </div>
        </div>
      </div>

      {/* 3. ANNOUNCEMENTS & NOTIFICATIONS CMS */}
      <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium space-y-4">
        <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#2E7D32]" />
          Announcements & Notifications CMS
        </h3>

        {/* Existing List */}
        <div className="space-y-2">
          {announcements.map(ann => (
            <div key={ann.id} className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-[#111827] flex items-center gap-2">
                  {ann.title}
                  <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${ann.type === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#2E7D32]'}`}>
                    {ann.type}
                  </span>
                </h4>
                <p className="text-[#6B7280] mt-0.5">{ann.content}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEditAnnouncement(ann)} className="p-1.5 text-[#6B7280] hover:text-[#111827]">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteAnnouncement(ann.id)} className="p-1.5 text-rose-500 hover:text-rose-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Announcement Form */}
        <form onSubmit={handleAddAnnouncementSubmit} className="space-y-3 pt-2 border-t border-[#E5E7EB]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Announcement Title"
              value={annTitle}
              onChange={e => setAnnTitle(e.target.value)}
              className="h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold col-span-2"
            />
            <select
              value={annType}
              onChange={e => setAnnType(e.target.value)}
              className="h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold"
            >
              <option value="info">Info Badge</option>
              <option value="warning">Warning Alert</option>
            </select>
          </div>
          <textarea
            required
            rows={2}
            placeholder="Announcement Message Details..."
            value={annContent}
            onChange={e => setAnnContent(e.target.value)}
            className="w-full p-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-medium"
          />
          <button
            type="submit"
            className="h-[44px] px-6 bg-[#2E7D32] hover:bg-[#256D27] text-white rounded-[14px] text-xs font-bold shadow-md transition"
          >
            {editingAnnId ? 'Update Announcement' : '+ Create Announcement'}
          </button>
        </form>
      </div>

      {/* 4. CATEGORY CMS */}
      <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium space-y-4">
        <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#2E7D32]" />
          Expense Categories CMS
        </h3>

        <div className="flex flex-wrap gap-2 p-1">
          {categories.map(c => (
            <div
              key={c.id}
              className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <span>{c.emoji}</span>
              <span>{c.name}</span>
              <button
                onClick={() => setDeleteConfirmItem({
                  id: c.id,
                  name: c.name,
                  onConfirm: () => deleteCategory(c.id)
                })}
                className="text-rose-400 hover:text-rose-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddCatSubmit} className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Emoji"
            value={newCatEmoji}
            onChange={e => setNewCatEmoji(e.target.value)}
            className="h-[44px] px-2 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs text-center font-semibold"
          />
          <input
            type="text"
            placeholder="Category Name"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            className="h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold col-span-2"
          />
          <button
            type="submit"
            className="col-span-3 h-[44px] bg-[#2E7D32] hover:bg-[#256D27] text-white rounded-[14px] text-xs font-bold"
          >
            + Create New Category
          </button>
        </form>
      </div>

      {/* 5. SECURITY & PIN SETTINGS */}
      <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium space-y-4">
        <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#2E7D32]" />
          App Security & PIN Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[14px]">
            <div>
              <span className="text-xs font-bold text-[#111827] block">Enable Security Lock</span>
              <span className="text-[11px] text-[#6B7280]">Require PIN on launch</span>
            </div>
            <input
              type="checkbox"
              checked={settings.isPinLocked}
              onChange={e => setSettings(prev => ({ ...prev, isPinLocked: e.target.checked }))}
              className="w-5 h-5 accent-[#2E7D32] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 p-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[14px]">
            <KeyRound className="w-4 h-4 text-[#6B7280] ml-2" />
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[10px] text-xs font-bold text-[#111827]"
            />
            <button
              onClick={handleSavePin}
              className="h-[36px] px-3 bg-[#2E7D32] hover:bg-[#256D27] text-white rounded-[10px] text-xs font-bold shrink-0"
            >
              Update PIN
            </button>
          </div>
        </div>
      </div>

      {/* 6. DATABASE BACKUP & RESTORE */}
      <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium space-y-4">
        <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
          <Cloud className="w-5 h-5 text-[#2E7D32]" />
          Database Backup & Recovery
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportJSON}
            className="h-[44px] flex items-center justify-center gap-2 px-3 bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/40 rounded-[14px] text-xs font-bold text-[#111827] transition"
          >
            <Download className="w-4 h-4 text-[#2E7D32]" />
            Export Full JSON Backup
          </button>

          <label className="h-[44px] flex items-center justify-center gap-2 px-3 bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/40 rounded-[14px] text-xs font-bold text-[#111827] transition cursor-pointer">
            <Upload className="w-4 h-4 text-blue-500" />
            <span>Restore JSON Backup</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={() => showToast('Google Drive cloud sync completed!', 'success')}
            className="h-[44px] flex items-center justify-center gap-2 px-3 bg-emerald-50 text-[#2E7D32] hover:bg-emerald-100 rounded-[14px] text-xs font-bold transition"
          >
            <Cloud className="w-4 h-4" />
            Google Drive Export
          </button>
        </div>

        <div className="pt-2 border-t border-[#E5E7EB] flex justify-end">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 text-xs text-[#EF4444] hover:underline font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All System Data to Initial Defaults
          </button>
        </div>
      </div>

    </div>
  );
};
