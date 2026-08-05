import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowLeft,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon
} from 'lucide-react';
import { formatIndianNumber } from '../utils/numberFormat';
import { formatDisplayDate } from '../utils/dateFormat';
import { motion } from 'framer-motion';

export const PublicDashboard = ({ onNavigateTab, onOpenAdd }) => {
  const {
    familySettings,
    currentBalance,
    totalIncome,
    totalExpense,
    transactions,
    familyMembers,
    setReceiptModalUrl,
    setReceiptModalTitle
  } = useApp();

  // Navigation tab within Public View: 'dashboard' | 'income' | 'expense' | 'transactions'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Search & Filter state for sub-pages
  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Latest 5 transactions for Dashboard
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const incomePercent = totalIncome > 0 ? 100 : 0;
  const expensePercent = totalIncome > 0 ? Math.min(Math.round((totalExpense / totalIncome) * 100), 100) : 50;

  const handleOpenReceipt = (t) => {
    const url = t.attachmentUrl || t.attachment_url || t.receipt_url;
    if (url) {
      setReceiptModalUrl(url);
      setReceiptModalTitle(t.attachmentName || t.attachment_name || 'Receipt Attachment');
    }
  };

  // Helper to filter items for sub-pages
  const getFilteredItems = (type) => {
    let list = [];
    if (type === 'income') {
      list = transactions.filter(t => t.type === 'income');
    } else if (type === 'expense') {
      list = transactions.filter(t => t.type === 'expense');
    } else {
      list = transactions;
    }

    return list.filter(item => {
      const q = searchQuery.toLowerCase();
      const formattedDate = formatDisplayDate(item.date).toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (item.source || '').toLowerCase().includes(q) ||
        (item.category || item.expense_name || '').toLowerCase().includes(q) ||
        (item.member || '').toLowerCase().includes(q) ||
        (item.notes || item.note || '').toLowerCase().includes(q) ||
        item.amount.toString().includes(q) ||
        formattedDate.includes(q);

      const matchesMember = memberFilter === 'all' || item.member === memberFilter;

      return matchesSearch && matchesMember;
    });
  };

  const currentFilteredList = getFilteredItems(activeTab);
  const totalPages = Math.max(1, Math.ceil(currentFilteredList.length / itemsPerPage));
  const paginatedList = currentFilteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setSearchQuery('');
    setMemberFilter('all');
    setCurrentPage(1);
  };

  const handleTabSwitch = (tab) => {
    resetFilters();
    setActiveTab(tab);
    if (onNavigateTab) onNavigateTab(tab);
  };

  // ----------------------------------------------------
  // SUB-PAGES: INCOME / EXPENSE / TRANSACTIONS LIST VIEW
  // ----------------------------------------------------
  if (activeTab !== 'dashboard') {
    const isIncomeTab = activeTab === 'income';
    const isExpenseTab = activeTab === 'expense';
    const title = isIncomeTab ? 'All Income Records' : isExpenseTab ? 'All Expense Records' : 'All Family Transactions';

    return (
      <div className="space-y-6 pb-20 md:pb-8 max-w-2xl mx-auto">
        {/* Header & Back Button */}
        <div className="flex items-center justify-between bg-[#FFFFFF] rounded-[20px] p-4 border border-[#E5E7EB] shadow-xs">
          <button
            onClick={() => handleTabSwitch('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[#2E7D32] hover:bg-emerald-100 text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <span className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">
            {title} ({currentFilteredList.length})
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-4 border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search amount, source, member..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[40px] pl-9 pr-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            {/* Member Filter Dropdown */}
            <div className="relative flex items-center">
              <Filter className="w-4 h-4 absolute left-3 text-[#6B7280]" />
              <select
                value={memberFilter}
                onChange={e => {
                  setMemberFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[40px] pl-9 pr-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="all">All Family Members</option>
                {familyMembers.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Paginated List */}
        <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-[#E5E7EB] shadow-xs space-y-3">
          {paginatedList.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-[#6B7280]">
              No records found matching your filters.
            </div>
          ) : (
            paginatedList.map(t => {
              const isInc = t.type === 'income';
              const receiptUrl = t.attachmentUrl || t.attachment_url || t.receipt_url;

              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isInc
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] hover:bg-[#DCFCE7]/50'
                      : 'bg-[#FEF2F2] border-[#FECACA] hover:bg-[#FEE2E2]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isInc ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-[#FEE2E2] text-[#EF4444]'
                      }`}
                    >
                      {isInc ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-[#111827] truncate">
                          {isInc ? t.source : (t.category || t.expense_name)}
                        </h4>
                        {t.member && (
                          <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-[#2E7D32] border border-emerald-100 shrink-0">
                            {t.member}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#6B7280] block mt-0.5">
                        {formatDisplayDate(t.date)} {t.notes || t.note ? `• ${t.notes || t.note}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-extrabold ${isInc ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {isInc ? '+' : '-'} {familySettings.currency}{formatIndianNumber(t.amount)}
                    </span>

                    {receiptUrl && (
                      <button
                        onClick={() => handleOpenReceipt(t)}
                        className="p-1 text-[#2E7D32] hover:bg-emerald-50 rounded transition"
                        title="View Receipt"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-bold">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100 transition"
              >
                <PrevIcon className="w-3.5 h-3.5" /> Prev
              </button>

              <span className="text-[#6B7280]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100 transition"
              >
                Next <NextIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN DASHBOARD OVERVIEW VIEW
  // ----------------------------------------------------
  const isBalancePositive = currentBalance >= 0;

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-2xl mx-auto">
      
      {/* Large Hero Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FFFFFF] rounded-[24px] p-5 sm:p-6 border border-[#E5E7EB] shadow-xs space-y-4"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Family Finance Overview 🏡
          </h2>
          <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
            View your household income, expenses, balance, and recent transactions in one simple dashboard.
          </p>
        </div>

        {/* 1. BALANCE CARD (Compact, Black amount, Muted Gray subtitle) */}
        <div className="bg-[#FFFFFF] rounded-[18px] p-4 border border-[#E5E7EB] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Current Balance
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            {familySettings.currency}{formatIndianNumber(currentBalance)}
          </div>
          <span className="text-[10px] font-semibold text-[#6B7280] block">
            Auto-calculated (Income − Expense)
          </span>
        </div>

        {/* 2. INCOME & EXPENSE CARDS GRID (Compact 30-40% reduced height) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* INCOME CARD */}
          <div className="bg-[#F0FDF4] rounded-[18px] p-4 border border-[#BBF7D0] shadow-xs space-y-1.5 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#22C55E] flex items-center justify-center font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Total Income
                </span>
              </div>
              <button
                onClick={() => handleTabSwitch('income')}
                className="px-2 py-0.5 rounded-md bg-white border border-[#BBF7D0] text-[#2E7D32] hover:bg-emerald-100 text-[10px] font-extrabold transition flex items-center gap-0.5"
                title="View all income records"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="text-2xl font-black text-[#22C55E]">
              {familySettings.currency}{formatIndianNumber(totalIncome)}
            </div>
          </div>

          {/* EXPENSE CARD */}
          <div className="bg-[#FEF2F2] rounded-[18px] p-4 border border-[#FECACA] shadow-xs space-y-1.5 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center font-bold">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Total Expenses
                </span>
              </div>
              <button
                onClick={() => handleTabSwitch('expense')}
                className="px-2 py-0.5 rounded-md bg-white border border-[#FECACA] text-[#EF4444] hover:bg-rose-100 text-[10px] font-extrabold transition flex items-center gap-0.5"
                title="View all expense records"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="text-2xl font-black text-[#EF4444]">
              {familySettings.currency}{formatIndianNumber(totalExpense)}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {onOpenAdd && (
          <div className="grid grid-cols-2 gap-3 pt-0.5">
            <button
              onClick={() => onOpenAdd('income')}
              className="h-[40px] rounded-[12px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              + Add Income
            </button>
            <button
              onClick={() => onOpenAdd('expense')}
              className="h-[44px] rounded-[14px] bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              + Add Expense
            </button>
          </div>
        )}
      </motion.div>

      {/* Recent Transactions Section */}
      <div className="bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#111827]">
            Recent Transactions
          </h3>
          <button
            onClick={() => handleTabSwitch('transactions')}
            className="text-xs font-bold text-[#2E7D32] flex items-center hover:underline gap-0.5"
            title="View all transactions"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-[#6B7280]">
              No transactions recorded yet.
            </div>
          ) : (
            recentTransactions.map(t => {
              const isIncome = t.type === 'income';
              const receiptUrl = t.attachmentUrl || t.attachment_url || t.receipt_url;

              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isIncome
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] hover:bg-[#DCFCE7]/50'
                      : 'bg-[#FEF2F2] border-[#FECACA] hover:bg-[#FEE2E2]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isIncome
                          ? 'bg-[#DCFCE7] text-[#22C55E]'
                          : 'bg-[#FEE2E2] text-[#EF4444]'
                      }`}
                    >
                      {isIncome ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-[#111827] truncate">
                          {isIncome ? t.source : (t.category || t.expense_name)}
                        </h4>
                        {t.member && (
                          <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-[#2E7D32] border border-emerald-100 shrink-0">
                            {t.member}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#6B7280] block mt-0.5">
                        {formatDisplayDate(t.date)}
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

                    {receiptUrl && (
                      <button
                        onClick={() => handleOpenReceipt(t)}
                        className="p-1 text-[#2E7D32] hover:bg-emerald-50 rounded transition"
                        title="View Receipt"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Monthly Summary Card */}
      <div className="bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-[#111827]">
          Monthly Summary
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#22C55E] font-extrabold">Income</span>
              <span className="text-[#111827]">{familySettings.currency}{formatIndianNumber(totalIncome)}</span>
            </div>
            <div className="h-3.5 w-full bg-[#F0FDF4] border border-[#BBF7D0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
                style={{ width: `${incomePercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#EF4444] font-extrabold">Expense</span>
              <span className="text-[#111827]">{familySettings.currency}{formatIndianNumber(totalExpense)}</span>
            </div>
            <div className="h-3.5 w-full bg-[#FEF2F2] border border-[#FECACA] rounded-full overflow-hidden">
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
