import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionCard } from './TransactionCard';
import { Search, Filter, Plus, ArrowDownRight, ArrowUpRight, RotateCcw, Trash2, Edit3, Download, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { exportToPDF, exportToExcel, exportToCSV } from '../utils/exportUtils';

export const TransactionsView = () => {
  const {
    isFamilyMode,
    transactions,
    categories,
    openAddModal,
    bulkDeleteTransactions,
    bulkUpdateCategory,
    setDeleteConfirmItem,
    showToast,
    familyInfo
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Bulk Selection
  const [selectedTxIds, setSelectedTxIds] = useState([]);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentYearStr = new Date().getFullYear().toString();

  // Filter & Sort Logic
  const filteredTransactions = transactions.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (t.amount || '').toString().includes(query) ||
      (t.category || '').toLowerCase().includes(query) ||
      (t.source || '').toLowerCase().includes(query) ||
      (t.addedBy || '').toLowerCase().includes(query) ||
      (t.paidBy || '').toLowerCase().includes(query) ||
      (t.receivedBy || '').toLowerCase().includes(query) ||
      (t.notes || '').toLowerCase().includes(query) ||
      (t.date || '').includes(query);

    const matchesType = selectedType === 'all' || t.type === selectedType;

    const matchesCategory =
      selectedCategory === 'all' ||
      t.category === selectedCategory ||
      t.source === selectedCategory;

    let matchesDate = true;
    if (dateFilter === 'today') matchesDate = t.date === todayStr;
    else if (dateFilter === 'yesterday') matchesDate = t.date === yesterdayStr;
    else if (dateFilter === 'month') matchesDate = (t.date || '').startsWith(currentMonthStr);
    else if (dateFilter === 'year') matchesDate = (t.date || '').startsWith(currentYearStr);
    else if (dateFilter === 'custom') {
      if (customStartDate && t.date < customStartDate) matchesDate = false;
      if (customEndDate && t.date > customEndDate) matchesDate = false;
    }

    return matchesSearch && matchesType && matchesCategory && matchesDate;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'highest') return Number(b.amount) - Number(a.amount);
    if (sortBy === 'lowest') return Number(a.amount) - Number(b.amount);
    return 0;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalFilteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalFilteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedTxIds.length === paginatedTransactions.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(paginatedTransactions.map(t => t.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedTxIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (selectedTxIds.length === 0) return;
    setDeleteConfirmItem({
      id: 'bulk',
      title: `${selectedTxIds.length} selected transaction records`,
      onConfirm: () => {
        bulkDeleteTransactions(selectedTxIds);
        setSelectedTxIds([]);
      }
    });
  };

  const handleBulkCategoryApply = () => {
    if (selectedTxIds.length === 0 || !bulkCategoryTarget) return;
    bulkUpdateCategory(selectedTxIds, bulkCategoryTarget);
    setSelectedTxIds([]);
    setBulkCategoryTarget('');
  };

  const handleBulkExportPDF = () => {
    const selectedList = transactions.filter(t => selectedTxIds.includes(t.id));
    exportToPDF(selectedList.length > 0 ? selectedList : filteredTransactions);
    showToast('Exported PDF report successfully!', 'success');
  };

  const handleBulkExportExcel = () => {
    const selectedList = transactions.filter(t => selectedTxIds.includes(t.id));
    exportToExcel(selectedList.length > 0 ? selectedList : filteredTransactions);
    showToast('Exported Excel file successfully!', 'success');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('newest');
    setCurrentPage(1);
    setSelectedTxIds([]);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">
            Transactions CMS Manager
          </h2>
          <p className="text-xs text-[#6B7280]">
            Complete database management with bulk edit, bulk delete, search, sorting & export
          </p>
        </div>

        {!isFamilyMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddModal('income')}
              className="h-[44px] px-4 rounded-[14px] bg-emerald-50 text-[#2E7D32] hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowDownRight className="w-4 h-4" />
              + Income
            </button>
            <button
              onClick={() => openAddModal('expense')}
              className="h-[44px] px-4 rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + Expense
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-4 bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#22C55E] flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#6B7280]">Filtered Income Total</span>
            <div className="text-lg font-extrabold text-[#22C55E]">
              {familyInfo.currency}{totalFilteredIncome.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#EF4444] flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#6B7280]">Filtered Expense Total</span>
            <div className="text-lg font-extrabold text-[#EF4444]">
              {familyInfo.currency}{totalFilteredExpense.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk CMS Toolbar (Shown when items selected in Admin Mode) */}
      {!isFamilyMode && selectedTxIds.length > 0 && (
        <div className="p-3.5 bg-emerald-900 text-white rounded-[16px] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold animate-slide-down">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-700 rounded-full font-extrabold">
              {selectedTxIds.length} Selected
            </span>
            <span>Bulk CMS Actions</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Category Change */}
            <select
              value={bulkCategoryTarget}
              onChange={e => setBulkCategoryTarget(e.target.value)}
              className="h-[36px] px-2.5 bg-emerald-800 border border-emerald-700 text-white text-xs font-semibold rounded-[10px]"
            >
              <option value="">Change Category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
            {bulkCategoryTarget && (
              <button
                onClick={handleBulkCategoryApply}
                className="h-[36px] px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[10px] text-xs font-bold"
              >
                Apply
              </button>
            )}

            {/* Bulk Export */}
            <button
              onClick={handleBulkExportPDF}
              className="h-[36px] px-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-[10px] text-xs font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={handleBulkExportExcel}
              className="h-[36px] px-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-[10px] text-xs font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Excel
            </button>

            {/* Bulk Delete */}
            <button
              onClick={handleBulkDelete}
              className="h-[36px] px-3 bg-[#EF4444] hover:bg-rose-700 text-white rounded-[10px] text-xs font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Multi-Filter & Search Panel */}
      <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search by amount, category, notes, or date..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-[44px] pl-11 pr-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs sm:text-sm text-[#111827] placeholder-[#6B7280] focus:ring-2 focus:ring-[#2E7D32]"
          />
        </div>

        {/* Date Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-[11px] font-semibold text-[#6B7280] mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Date:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
            { id: 'custom', label: 'Custom Range' }
          ].map(d => (
            <button
              key={d.id}
              onClick={() => {
                setDateFilter(d.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-full font-semibold shrink-0 transition-all ${
                dateFilter === d.id
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold text-[#111827]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold text-[#111827]"
              />
            </div>
          </div>
        )}

        {/* Dropdowns Row (Type, Category, Sort, Reset) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Type</label>
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold text-[#111827]"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold text-[#111827]"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-semibold text-[#111827]"
            >
              <option value="newest">Date: Newest First</option>
              <option value="oldest">Date: Oldest First</option>
              <option value="highest">Amount: Highest First</option>
              <option value="lowest">Amount: Lowest First</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full h-[44px] bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/40 text-[#111827] rounded-[14px] text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

      </div>

      {/* Select All Bar (Admin Mode) */}
      {!isFamilyMode && paginatedTransactions.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs font-bold text-[#6B7280]">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-[#2E7D32] hover:underline"
          >
            {selectedTxIds.length === paginatedTransactions.length ? (
              <CheckSquare className="w-4 h-4 text-[#2E7D32]" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Select All on Page ({paginatedTransactions.length})
          </button>
          <span>Page {currentPage} of {totalPages} ({filteredTransactions.length} records)</span>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-[20px] p-8 text-center border border-[#E5E7EB] shadow-premium">
            <p className="text-[#6B7280] text-sm">No transaction records match your filters.</p>
            <button
              onClick={resetFilters}
              className="mt-3 text-xs font-bold text-[#2E7D32] hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          paginatedTransactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-2">
              {!isFamilyMode && (
                <button
                  onClick={() => toggleSelectOne(tx.id)}
                  className="p-1 text-[#2E7D32] focus:outline-none"
                >
                  {selectedTxIds.includes(tx.id) ? (
                    <CheckSquare className="w-5 h-5 text-[#2E7D32]" />
                  ) : (
                    <Square className="w-5 h-5 text-[#D1D5DB]" />
                  )}
                </button>
              )}
              <div className="flex-1">
                <TransactionCard transaction={tx} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-[#FFFFFF] rounded-[20px] border border-[#E5E7EB] shadow-premium text-xs font-bold text-[#111827]">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/40 disabled:opacity-50 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/40 disabled:opacity-50 transition flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
