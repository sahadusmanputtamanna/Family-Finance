import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Clock, Plus, Trash2, Calendar, Edit2, Eye, Repeat, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDisplayDate } from '../utils/dateFormat';

export const BillsView = () => {
  const {
    isFamilyMode,
    bills,
    addBill,
    updateBill,
    deleteBill,
    toggleBillStatus,
    setViewDetailItem,
    setDeleteConfirmItem,
    familyInfo
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const [formBill, setFormBill] = useState({
    name: '',
    category: 'Electricity',
    icon: '💡',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    recurring: 'Monthly',
    reminderDays: 3
  });

  const handleOpenAdd = () => {
    setEditingBill(null);
    setFormBill({
      name: '',
      category: 'Electricity',
      icon: '💡',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      recurring: 'Monthly',
      reminderDays: 3
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBill(b);
    setFormBill({
      name: b.name,
      category: b.category || 'Electricity',
      icon: b.icon || '💡',
      amount: b.amount.toString(),
      dueDate: b.dueDate,
      recurring: b.recurring || 'Monthly',
      reminderDays: b.reminderDays || 3
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formBill.name || !formBill.amount) return;

    if (editingBill) {
      updateBill(editingBill.id, {
        ...formBill,
        amount: Number(formBill.amount)
      });
    } else {
      addBill({
        ...formBill,
        amount: Number(formBill.amount)
      });
    }

    setIsAddModalOpen(false);
  };

  const pendingBills = bills.filter(b => b.status === 'Pending');
  const paidBills = bills.filter(b => b.status === 'Paid');

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">
            Upcoming Bills & Reminders CMS
          </h2>
          <p className="text-xs text-[#6B7280]">
            Track utility bills, set recurring deadlines, configure reminder alerts, and manage payments
          </p>
        </div>

        {!isFamilyMode && (
          <button
            onClick={handleOpenAdd}
            className="h-[44px] px-4 rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Add Bill Reminder
          </button>
        )}
      </div>

      {/* Pending Bills */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F59E0B]" />
          Pending Bills ({pendingBills.length})
        </h3>

        {pendingBills.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-[20px] p-6 text-center border border-[#E5E7EB] shadow-premium text-xs text-[#6B7280]">
            🎉 All family bills are paid up to date!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingBills.map(bill => (
              <motion.div
                key={bill.id}
                whileHover={{ y: -2 }}
                className="bg-[#FFFFFF] rounded-[20px] p-4 border border-[#E5E7EB] shadow-premium flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center text-2xl shrink-0 border border-amber-100">
                    {bill.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                      {bill.name}
                      {bill.recurring && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-50 text-blue-600">
                          {bill.recurring}
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                      <span className="flex items-center gap-1 text-[#F59E0B] font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {formatDisplayDate(bill.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-base font-extrabold text-[#111827]">
                    {familyInfo.currency}{Number(bill.amount).toLocaleString('en-IN')}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewDetailItem(bill)}
                      className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {!isFamilyMode ? (
                      <>
                        <button
                          onClick={() => handleOpenEdit(bill)}
                          className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]"
                          title="Edit Bill"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem({
                            id: bill.id,
                            name: bill.name,
                            onConfirm: () => deleteBill(bill.id)
                          })}
                          className="p-1.5 rounded-lg bg-rose-50 text-[#EF4444] hover:bg-rose-100"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleBillStatus(bill.id)}
                          className="h-[32px] px-2.5 bg-[#2E7D32] hover:bg-[#256D27] text-white text-xs font-bold rounded-[8px] transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Paid
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Paid Bills */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#22C55E]" />
          Paid / Completed Bills ({paidBills.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paidBills.map(bill => (
            <div
              key={bill.id}
              className="bg-[#FFFFFF] rounded-2xl p-3.5 border border-[#E5E7EB] flex items-center justify-between shadow-premium opacity-90"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{bill.icon}</span>
                <div>
                  <h4 className="font-bold text-xs text-[#111827]">
                    {bill.name}
                  </h4>
                  <span className="text-[11px] text-[#22C55E] font-semibold">
                    Paid by {bill.paidBy || 'Usman'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111827]">
                  {familyInfo.currency}{Number(bill.amount).toLocaleString('en-IN')}
                </span>
                {!isFamilyMode && (
                  <button
                    onClick={() => toggleBillStatus(bill.id)}
                    className="p-1 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]"
                    title="Mark Unpaid"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Bill Modal */}
      {!isFamilyMode && isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-[#111827]">
              {editingBill ? 'Edit Bill Reminder' : 'Add Bill Reminder'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Bill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electricity Bill"
                  value={formBill.name}
                  onChange={e => setFormBill({ ...formBill, name: e.target.value })}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold text-[#111827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={formBill.amount}
                    onChange={e => setFormBill({ ...formBill, amount: e.target.value })}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formBill.dueDate}
                    onChange={e => setFormBill({ ...formBill, dueDate: e.target.value })}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold text-[#111827]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-bold text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold hover:bg-[#256D27]"
                >
                  {editingBill ? 'Save Changes' : 'Add Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
