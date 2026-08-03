import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ArrowDownRight, ArrowUpRight, Upload, Camera, FileCheck, Save, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';

export const AddTransactionModal = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    addModalType,
    editingTransaction,
    setEditingTransaction,
    categories,
    incomeSources,
    adminProfile,
    addTransaction,
    updateTransaction,
    showToast,
    familyInfo
  } = useApp();

  const adminName = adminProfile?.name || 'Usman';

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: 'Food',
    source: 'Salary',
    paidBy: adminName,
    receivedBy: adminName,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    notes: '',
    recurring: false,
    attachmentName: '',
    attachmentUrl: ''
  });

  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        amount: editingTransaction.amount || '',
        type: editingTransaction.type || 'expense',
        category: editingTransaction.category || 'Food',
        source: editingTransaction.source || 'Salary',
        paidBy: editingTransaction.paidBy || adminName,
        receivedBy: editingTransaction.receivedBy || adminName,
        date: editingTransaction.date || new Date().toISOString().split('T')[0],
        paymentMethod: editingTransaction.paymentMethod || 'UPI',
        notes: editingTransaction.notes || '',
        recurring: editingTransaction.recurring || false,
        attachmentName: editingTransaction.attachmentName || '',
        attachmentUrl: editingTransaction.attachmentUrl || ''
      });
    } else {
      // Check for saved draft
      const draft = localStorage.getItem('ffh_tx_draft');
      if (draft && isAddModalOpen) {
        try {
          const parsed = JSON.parse(draft);
          setFormData(parsed);
          showToast('Loaded saved transaction draft!', 'info');
        } catch(e) {}
      } else {
        setFormData({
          amount: '',
          type: addModalType,
          category: categories[0]?.name || 'Food',
          source: incomeSources[0] || 'Salary',
          paidBy: adminName,
          receivedBy: adminName,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'UPI',
          notes: '',
          recurring: false,
          attachmentName: '',
          attachmentUrl: ''
        });
      }
    }
  }, [editingTransaction, addModalType, isAddModalOpen, adminName]);

  if (!isAddModalOpen) return null;

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSaveDraft = () => {
    localStorage.setItem('ffh_tx_draft', JSON.stringify(formData));
    setDraftSaved(true);
    showToast('Transaction form saved as Draft!', 'success');
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        attachmentName: file.name,
        attachmentUrl: url
      }));
    }
  };

  const handleSampleReceipt = () => {
    setFormData(prev => ({
      ...prev,
      attachmentName: 'Receipt_Aug2026.jpg',
      attachmentUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      showToast('Please enter a valid amount greater than 0', 'warning');
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, formData);
    } else {
      addTransaction(formData);
      localStorage.removeItem('ffh_tx_draft');
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#FFFFFF] rounded-[24px] overflow-hidden shadow-2xl border border-[#E5E7EB] flex flex-col max-h-[92vh]"
      >
        
        {/* Header Tabs */}
        <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex bg-[#E5E7EB]/60 p-1 rounded-[14px]">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-xs font-bold transition-all ${
                formData.type === 'income'
                  ? 'bg-[#22C55E] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              + Income
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-xs font-bold transition-all ${
                formData.type === 'expense'
                  ? 'bg-[#EF4444] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              + Expense
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-xs font-bold text-[#6B7280] hover:text-[#111827] flex items-center gap-1.5"
              title="Save Form Draft"
            >
              <Save className="w-3.5 h-3.5 text-[#2E7D32]" />
              {draftSaved ? 'Saved' : 'Draft'}
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">
              Amount ({familyInfo.currency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-[#6B7280]">{familyInfo.currency}</span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full h-[44px] pl-10 pr-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xl font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {/* Type Specific Fields */}
          {formData.type === 'income' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Income Source
                </label>
                <select
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                >
                  {incomeSources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Received By
                </label>
                <select
                  value={formData.receivedBy}
                  onChange={e => setFormData({ ...formData, receivedBy: e.target.value })}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                >
                  <option value={adminName}>{adminProfile?.avatar || '👤'} {adminName}</option>
                </select>
              </div>
            </div>
          ) : (
            <>
              {/* Expense Category Grid */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                  Expense Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 bg-[#F8FAFC] rounded-[14px] border border-[#E5E7EB]">
                  {categories.map(cat => {
                    const isSelected = formData.category === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.name })}
                        className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-[#2E7D32] text-white font-bold shadow-xs'
                            : 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] hover:bg-[#E5E7EB]/40'
                        }`}
                      >
                        <span className="text-base">{cat.emoji}</span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                    Paid By
                  </label>
                  <select
                    value={formData.paidBy}
                    onChange={e => setFormData({ ...formData, paidBy: e.target.value })}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                  >
                    <option value={adminName}>{adminProfile?.avatar || '👤'} {adminName}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="UPI">📱 UPI / GPay</option>
                    <option value="Bank">🏦 Bank Transfer</option>
                    <option value="Card">💳 Card</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">
                Notes / Description
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly Grocery"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
              />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[14px]">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#2E7D32]" />
              <div>
                <span className="text-xs font-bold text-[#111827] block">Recurring Transaction</span>
                <span className="text-[11px] text-[#6B7280]">Mark as recurring monthly expense/income</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.recurring}
              onChange={e => setFormData({ ...formData, recurring: e.target.checked })}
              className="w-4 h-4 accent-[#2E7D32] rounded cursor-pointer"
            />
          </div>

          {/* Attachment Upload */}
          <div className="border border-dashed border-[#D1D5DB] rounded-[14px] p-4 bg-[#F8FAFC]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#111827] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#2E7D32]" />
                Receipt Attachment
              </span>
              <button
                type="button"
                onClick={handleSampleReceipt}
                className="text-[11px] font-bold text-[#2E7D32] hover:underline"
              >
                + Add Sample Receipt
              </button>
            </div>

            {formData.attachmentName ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
                  <span className="text-xs text-[#2E7D32] font-semibold truncate">
                    {formData.attachmentName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, attachmentName: '', attachmentUrl: '' }))}
                  className="text-xs text-[#EF4444] font-bold hover:underline ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FFFFFF] border border-[#D1D5DB] rounded-xl text-xs font-semibold text-[#111827] cursor-pointer hover:bg-[#E5E7EB]/30 transition">
                <Camera className="w-4 h-4 text-[#6B7280]" />
                <span>Upload Photo or PDF</span>
                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs shadow-md transition-all duration-200"
            >
              {editingTransaction ? 'Save Changes' : `Save ${formData.type === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
