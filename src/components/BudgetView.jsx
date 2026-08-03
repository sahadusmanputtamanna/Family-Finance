import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Edit2, AlertTriangle, ShieldAlert, Plus, Trash2, Eye, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';

export const BudgetView = () => {
  const {
    isFamilyMode,
    categories,
    updateCategoryBudget,
    addCategory,
    deleteCategory,
    transactions,
    setViewDetailItem,
    setDeleteConfirmItem,
    familyInfo
  } = useApp();

  const [editingCatId, setEditingCatId] = useState(null);
  const [tempBudget, setTempBudget] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newCat, setNewCat] = useState({
    name: '',
    emoji: '📦',
    budget: '5000',
    color: '#2E7D32'
  });

  const handleStartEdit = (cat) => {
    if (isFamilyMode) return;
    setEditingCatId(cat.id);
    setTempBudget(cat.budget.toString());
  };

  const handleSaveEdit = (catId) => {
    if (tempBudget && Number(tempBudget) >= 0) {
      updateCategoryBudget(catId, tempBudget);
    }
    setEditingCatId(null);
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    addCategory({
      name: newCat.name.trim(),
      emoji: newCat.emoji || '📦',
      budget: Number(newCat.budget) || 5000,
      color: newCat.color || '#2E7D32'
    });
    setNewCat({ name: '', emoji: '📦', budget: '5000', color: '#2E7D32' });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">
            Category Budgets & Spending Limits
          </h2>
          <p className="text-xs text-[#6B7280]">
            Set spending limits per category, configure alert thresholds, and keep expenses on target
          </p>
        </div>

        {!isFamilyMode && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-[44px] px-4 rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Create Category Budget
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category === cat.name)
            .reduce((sum, t) => sum + Number(t.amount || 0), 0) || (cat.name === 'Food' ? 8650 : cat.name === 'House' ? 14700 : cat.name === 'EMI' ? 12500 : 1200);

          const budget = cat.budget || 5000;
          const remaining = budget - spent;
          const percent = Math.min(Math.round((spent / budget) * 100), 100);

          const isOver = spent > budget;
          const isWarning = percent >= 80 && !isOver;

          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -2 }}
              className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center border border-emerald-100">
                    {cat.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
                      {cat.name}
                      {isOver && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#EF4444] border border-rose-100 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Over Budget
                        </span>
                      )}
                      {isWarning && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-[#F59E0B] border border-amber-100 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> 80%+ Used
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Limit: {familyInfo.currency}{budget.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewDetailItem(cat)}
                    className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
                    title="View Category Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {!isFamilyMode && (
                    <>
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
                        title="Edit Budget Limit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmItem({
                          id: cat.id,
                          name: cat.name,
                          onConfirm: () => deleteCategory(cat.id)
                        })}
                        className="p-2 rounded-xl text-[#EF4444] hover:bg-rose-50 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Budget Input */}
              {!isFamilyMode && editingCatId === cat.id ? (
                <div className="flex items-center gap-2 p-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[14px]">
                  <input
                    type="number"
                    value={tempBudget}
                    onChange={e => setTempBudget(e.target.value)}
                    className="w-full h-[40px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[10px] text-xs font-bold text-[#111827]"
                  />
                  <button
                    onClick={() => handleSaveEdit(cat.id)}
                    className="h-[40px] px-4 bg-[#2E7D32] hover:bg-[#256D27] text-white rounded-[10px] text-xs font-bold shrink-0"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  {/* Spend Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <span className="text-[#6B7280] block text-[10px] uppercase font-bold">Spent</span>
                      <span className="font-extrabold text-[#111827] text-sm">
                        {familyInfo.currency}{spent.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <span className="text-[#6B7280] block text-[10px] uppercase font-bold">Remaining</span>
                      <span className={`font-extrabold text-sm ${isOver ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                        {isOver ? '-' : ''}{familyInfo.currency}{Math.abs(remaining).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[#6B7280]">
                      <span>Progress ({percent}%)</span>
                      <span>{familyInfo.currency}{spent.toLocaleString('en-IN')} / {familyInfo.currency}{budget.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-[#EF4444]' : percent > 80 ? 'bg-[#F59E0B]' : 'bg-[#2E7D32]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          );
        })}
      </div>

      {/* Create Category Modal */}
      {!isFamilyMode && isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-[#111827]">
              Create New Expense Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel & Insurance"
                  value={newCat.name}
                  onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Monthly Budget ({familyInfo.currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={newCat.budget}
                    onChange={e => setNewCat({ ...newCat, budget: e.target.value })}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={newCat.emoji}
                    onChange={e => setNewCat({ ...newCat, emoji: e.target.value })}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs text-center font-bold text-[#111827]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
