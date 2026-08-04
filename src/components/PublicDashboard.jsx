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
    income,
    expenses,
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
        <div className="flex items-center justify-between bg-[#FFFFFF] rounded-[20px] p-4 border border-[#E5E7EB] shadow-premium">
          <button
            onClick={() => handleTabSwitch('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#2E7D32] hover:bg-emerald-50 text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <span className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">
            {title} ({currentFilteredList.length})
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-4 border border-[#E5E7EB] shadow-premium space-y-3">
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
        <div className="bg-[#FFFFFF] rounded-[24px] p-5 border border-[#E5E7EB] shadow-premium space-y-3">
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
                  className="p-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-3 hover:bg-white transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isInc ? 'bg-emerald-100 text-[#2E7D32]' : 'bg-rose-100 text-[#EF4444]'
                      }`}
                    >
                      {isInc ? '⬇' : '⬆'}
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
                        className="p-1 text-[#2E7D32] hover:bg-emerald-50 rounded"
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
                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] disabled:opacity-40 flex items-center gap-1"
              >
                <PrevIcon className="w-3.5 h-3.5" /> Prev
              </button>

              <span className="text-[#6B7280]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] disabled:opacity-40 flex items-center gap-1"
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

        {/* Income Card & Expense Card Grid with View All → Buttons */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
          {/* Income Card */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> ↑ Income
              </span>
              <button
                onClick={() => handleTabSwitch('income')}
                className="text-[11px] font-extrabold text-[#2E7D32] hover:underline flex items-center gap-0.5"
                title="View all income records"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xl font-extrabold text-[#111827]">
              {familySettings.currency}{formatIndianNumber(totalIncome)}
            </div>
          </div>

          {/* Expense Card */}
          <div className="space-y-1 border-l border-[#E5E7EB] pl-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#EF4444] flex items-center gap-1">
                <TrendingDown className="w-4 h-4" /> ↓ Expense
              </span>
              <button
                onClick={() => handleTabSwitch('expense')}
                className="text-[11px] font-extrabold text-[#EF4444] hover:underline flex items-center gap-0.5"
                title="View all expense records"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
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

      {/* Recent Transactions Section */}
      <div className="bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-premium space-y-4">
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
                        className="p-1 text-[#2E7D32] hover:bg-emerald-50 rounded"
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
