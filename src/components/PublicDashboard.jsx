import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Calendar,
  Paperclip,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatIndianNumber } from '../utils/numberFormat';
import { motion } from 'framer-motion';

export const PublicDashboard = ({ onNavigateTab, onOpenAdd }) => {
  const {
    familySettings,
    currentBalance,
    totalIncome,
    totalExpense,
    transactions,
    setReceiptModalUrl,
    setReceiptModalTitle
  } = useApp();

  const recentTransactions = transactions.slice(0, 5);

  const incomePercent = totalIncome > 0 ? 100 : 0;
  const expensePercent = totalIncome > 0 ? Math.min(Math.round((totalExpense / totalIncome) * 100), 100) : 50;

  const handleOpenReceipt = (t) => {
    if (t.attachmentUrl) {
      setReceiptModalUrl(t.attachmentUrl);
      setReceiptModalTitle(t.attachmentName || 'Receipt Attachment');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-2xl mx-auto">
      
      {/* Hero Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FFFFFF] rounded-[24px] p-6 sm:p-8 border border-[#E5E7EB] shadow-premium space-y-6"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Family Finance Overview 🏡
          </h2>
          <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
            View your household income, expenses, balance, and recent transactions in one simple dashboard.
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
            Current Balance
          </span>
          <div className="text-4xl font-black text-[#111827] tracking-tight">
            {familySettings.currency}{formatIndianNumber(currentBalance)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> ↑ Income
            </span>
            <div className="text-xl font-extrabold text-[#111827]">
              {familySettings.currency}{formatIndianNumber(totalIncome)}
            </div>
          </div>

          <div className="space-y-1 border-l border-[#E5E7EB] pl-4">
            <span className="text-xs font-bold text-[#EF4444] flex items-center gap-1">
              <TrendingDown className="w-4 h-4" /> ↓ Expense
            </span>
            <div className="text-xl font-extrabold text-[#111827]">
              {familySettings.currency}{formatIndianNumber(totalExpense)}
            </div>
          </div>
        </div>

        {onOpenAdd && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => onOpenAdd('income')}
              className="h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              + Income
            </button>
            <button
              onClick={() => onOpenAdd('expense')}
              className="h-[44px] rounded-[14px] bg-white border border-[#2E7D32] text-[#2E7D32] hover:bg-emerald-50 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              + Expense
            </button>
          </div>
        )}
      </motion.div>

      {/* Recent Transactions */}
      <div className="bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-premium space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#111827]">
            Recent Transactions
          </h3>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-bold text-[#2E7D32] flex items-center hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {recentTransactions.map(t => {
            const isIncome = t.type === 'income';
            return (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-3 hover:bg-white transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isIncome
                        ? 'bg-emerald-100 text-[#2E7D32]'
                        : 'bg-rose-100 text-[#EF4444]'
                    }`}
                  >
                    {isIncome ? '⬇' : '⬆'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-[#111827] truncate">
                        {isIncome ? t.source : t.category}
                      </h4>
                      {t.member && (
                        <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-[#2E7D32] border border-emerald-100 shrink-0">
                          {t.member}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6B7280] block mt-0.5">
                      {t.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-sm font-extrabold ${
                      isIncome ? 'text-[#22C55E]' : 'text-[#EF4444]'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {familySettings.currency}{formatIndianNumber(t.amount)}
                  </span>

                  {t.attachmentUrl && (
                    <button
                      onClick={() => handleOpenReceipt(t)}
                      className="p-1 text-[#2E7D32] hover:bg-emerald-50 rounded"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-premium space-y-4">
        <h3 className="font-extrabold text-base text-[#111827]">
          Monthly Summary
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#2E7D32]">Income</span>
              <span className="text-[#111827]">{familySettings.currency}{formatIndianNumber(totalIncome)}</span>
            </div>
            <div className="h-3.5 w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2E7D32] rounded-full transition-all duration-500"
                style={{ width: `${incomePercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#EF4444]">Expense</span>
              <span className="text-[#111827]">{familySettings.currency}{formatIndianNumber(totalExpense)}</span>
            </div>
            <div className="h-3.5 w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#EF4444] rounded-full transition-all duration-500"
                style={{ width: `${expensePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
