import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { Plus, PiggyBank, CheckCircle2, Edit2, Trash2, Eye, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

export const GoalsView = () => {
  const {
    isFamilyMode,
    goals,
    addDepositToGoal,
    addGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    setViewDetailItem,
    setDeleteConfirmItem,
    familyInfo
  } = useApp();

  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [formGoal, setFormGoal] = useState({
    title: '',
    targetAmount: '',
    icon: '🎯',
    deadline: ''
  });

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setFormGoal({ title: '', targetAmount: '', icon: '🎯', deadline: '' });
    setIsAddGoalOpen(true);
  };

  const handleOpenEdit = (g) => {
    setEditingGoal(g);
    setFormGoal({
      title: g.title,
      targetAmount: g.targetAmount.toString(),
      icon: g.icon || '🎯',
      deadline: g.deadline || ''
    });
    setIsAddGoalOpen(true);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;

    addDepositToGoal(depositGoalId, depositAmount);

    const goal = goals.find(g => g.id === depositGoalId);
    if (goal && (goal.savedAmount + Number(depositAmount)) >= goal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setDepositGoalId(null);
    setDepositAmount('');
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (!formGoal.title || !formGoal.targetAmount) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        ...formGoal,
        targetAmount: Number(formGoal.targetAmount)
      });
    } else {
      addGoal({
        ...formGoal,
        targetAmount: Number(formGoal.targetAmount)
      });
    }

    setIsAddGoalOpen(false);
  };

  const activeGoals = goals.filter(g => !g.archived);
  const archivedGoals = goals.filter(g => g.archived);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">
            Savings Goals & Milestones CMS
          </h2>
          <p className="text-xs text-[#6B7280]">
            Create goals, deposit money, track progress percentage, and archive completed milestones
          </p>
        </div>

        {!isFamilyMode && (
          <button
            onClick={handleOpenAdd}
            className="h-[44px] px-4 rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + New Savings Goal
          </button>
        )}
      </div>

      {/* Active Savings Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeGoals.map(goal => {
          const percent = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
          const isCompleted = goal.savedAmount >= goal.targetAmount;

          return (
            <motion.div
              key={goal.id}
              whileHover={{ y: -2 }}
              className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2E7D32] border border-emerald-100 flex items-center justify-center text-2xl">
                    {goal.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
                      {goal.title}
                      {isCompleted && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#22C55E] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Target: {familyInfo.currency}{goal.targetAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewDetailItem(goal)}
                    className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {!isFamilyMode && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(goal)}
                        className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => archiveGoal(goal.id)}
                        className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]"
                        title="Archive Goal"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmItem({
                          id: goal.id,
                          title: goal.title,
                          onConfirm: () => deleteGoal(goal.id)
                        })}
                        className="p-1.5 rounded-lg bg-rose-50 text-[#EF4444] hover:bg-rose-100"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#6B7280]">
                  <span>Saved: {familyInfo.currency}{goal.savedAmount.toLocaleString('en-IN')} ({percent}%)</span>
                  <span>Target: {familyInfo.currency}{goal.targetAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-3 w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2E7D32] rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Add Deposit Button */}
              {!isFamilyMode && (
                <button
                  onClick={() => setDepositGoalId(goal.id)}
                  className="w-full h-[44px] rounded-[14px] bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <PiggyBank className="w-4 h-4" />
                  + Deposit Money
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {!isFamilyMode && depositGoalId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-[#111827]">
              Deposit Savings Contribution
            </h3>
            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Deposit Amount ({familyInfo.currency})</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-sm font-bold text-[#111827]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="flex-1 h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {!isFamilyMode && isAddGoalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-[#111827]">
              {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
            </h3>
            <form onSubmit={handleGoalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Land Deposit / Bike"
                  value={formGoal.title}
                  onChange={e => setFormGoal({ ...formGoal, title: e.target.value })}
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Target ({familyInfo.currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="200000"
                    value={formGoal.targetAmount}
                    onChange={e => setFormGoal({ ...formGoal, targetAmount: e.target.value })}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={formGoal.icon}
                    onChange={e => setFormGoal({ ...formGoal, icon: e.target.value })}
                    className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="flex-1 h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
