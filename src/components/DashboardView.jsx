import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionCard } from './TransactionCard';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ChevronRight,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';

export const DashboardView = () => {
  const {
    adminProfile,
    isFamilyMode,
    currentBalance,
    incomeThisMonth,
    expenseThisMonth,
    currentSavings,
    transactions,
    categories,
    openAddModal,
    setActiveTab
  } = useApp();

  const [activeChartTab, setActiveChartTab] = useState('overview');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const monthlyData = [
    { month: 'Mar', Income: 72000, Expense: 38000, Savings: 34000, CashFlow: 34000 },
    { month: 'Apr', Income: 80000, Expense: 42000, Savings: 38000, CashFlow: 38000 },
    { month: 'May', Income: 75000, Expense: 39000, Savings: 36000, CashFlow: 36000 },
    { month: 'Jun', Income: 88000, Expense: 45000, Savings: 43000, CashFlow: 43000 },
    { month: 'Jul', Income: 82000, Expense: 41000, Savings: 41000, CashFlow: 41000 },
    { month: 'Aug', Income: incomeThisMonth || 85000, Expense: expenseThisMonth || 41500, Savings: (incomeThisMonth - expenseThisMonth) || 43500, CashFlow: (incomeThisMonth - expenseThisMonth) || 43500 }
  ];

  const categoryChartData = categories.map(cat => {
    const totalSpent = transactions
      .filter(t => t.type === 'expense' && t.category === cat.name)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
      name: cat.name,
      value: totalSpent > 0 ? totalSpent : (cat.name === 'Food' ? 8650 : cat.name === 'House' ? 14700 : cat.name === 'EMI' ? 12500 : 2500),
      color: cat.color
    };
  }).filter(c => c.value > 0);

  const CHART_COLORS = ['#2E7D32', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316'];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Hero Dashboard Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FFFFFF] rounded-[20px] p-6 sm:p-8 border border-[#E5E7EB] shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#2E7D32] text-xs font-bold uppercase tracking-wider">
              {getGreeting()}
            </span>
            <span className="text-xs font-medium text-[#6B7280]">
              Monthly Financial Summary
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight pt-1">
            {isFamilyMode ? 'Family Finance Overview 🏡' : `Hello, ${adminProfile.name} 👋`}
          </h2>

          <p className="text-xs sm:text-sm text-[#6B7280]">
            {isFamilyMode
              ? 'Complete overview of household budget, savings rate, and expense analytics.'
              : 'Track household budget, upcoming bill reminders, and active family expenses cleanly.'}
          </p>
        </div>

        {/* Right Buttons (Only shown for Admin, hidden completely for Family View) */}
        {!isFamilyMode && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openAddModal('income')}
              className="h-[44px] px-5 rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white text-xs font-bold shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <ArrowDownRight className="w-4 h-4" />
              + Income
            </button>
            <button
              onClick={() => openAddModal('expense')}
              className="h-[44px] px-5 rounded-[14px] bg-white border border-[#2E7D32] text-[#2E7D32] hover:bg-emerald-50 text-xs font-bold transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Expense
            </button>
          </div>
        )}
      </motion.div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Balance */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E5E7EB] shadow-premium hover:shadow-premium-md transition-all duration-300 flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Today's Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-[#111827] tracking-tight">
              ₹{Number(currentBalance || 125430).toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-[#22C55E] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Income This Month */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E5E7EB] shadow-premium hover:shadow-premium-md transition-all duration-300 flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Income (This Month)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#22C55E] flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-[#22C55E] tracking-tight">
              ₹{Number(incomeThisMonth || 85000).toLocaleString('en-IN')}
            </div>
            <span className="mt-1 block text-[11px] text-[#6B7280]">Total Credited</span>
          </div>
        </motion.div>

        {/* Expense This Month */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E5E7EB] shadow-premium hover:shadow-premium-md transition-all duration-300 flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Expense (This Month)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#EF4444] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-[#EF4444] tracking-tight">
              ₹{Number(expenseThisMonth || 41500).toLocaleString('en-IN')}
            </div>
            <span className="mt-1 block text-[11px] text-[#6B7280]">48.8% of Total Income</span>
          </div>
        </motion.div>

        {/* Savings */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E5E7EB] shadow-premium hover:shadow-premium-md transition-all duration-300 flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Monthly Savings
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-[#111827] tracking-tight">
              ₹{Number(currentSavings || 43500).toLocaleString('en-IN')}
            </div>
            <span className="mt-1 block text-[11px] font-bold text-[#22C55E]">51.2% Savings Rate</span>
          </div>
        </motion.div>

      </div>

      {/* Charts Section */}
      <div className="bg-[#FFFFFF] rounded-[20px] p-6 border border-[#E5E7EB] shadow-premium">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#2E7D32]" />
              Financial Analytics & Trends
            </h3>
            <p className="text-xs text-[#6B7280]">
              Visual analysis of income, expenses, savings rate, and cash flow
            </p>
          </div>

          <div className="flex bg-[#F8FAFC] p-1 rounded-xl border border-[#E5E7EB] text-xs font-semibold overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Income vs Expense' },
              { id: 'trend', label: 'Monthly Trend' },
              { id: 'category', label: 'Category Breakdown' },
              { id: 'cashflow', label: 'Cash Flow' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg shrink-0 transition-all ${
                  activeChartTab === tab.id
                    ? 'bg-[#2E7D32] text-white shadow-xs font-bold'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          {activeChartTab === 'overview' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '12px', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend />
                <Bar dataKey="Income" fill="#2E7D32" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'trend' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="Savings" stroke="#2E7D32" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={3} />
                <Line type="monotone" dataKey="Expense" stroke="#EF4444" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'category' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'cashflow' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="Income" fill="#2E7D32" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="CashFlow" stroke="#3B82F6" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid for Expense Categories & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#111827] text-base">
              Recent Transactions
            </h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-semibold text-[#2E7D32] flex items-center hover:underline"
            >
              View All ({transactions.length})
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        </div>

        {/* Expense Categories Breakdown (1 Col) */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#111827] text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2E7D32]" />
                Expense Categories
              </h3>
              {!isFamilyMode && (
                <button
                  onClick={() => setActiveTab('budget')}
                  className="text-xs font-semibold text-[#2E7D32] hover:underline"
                >
                  Budget Settings
                </button>
              )}
            </div>

            <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
              {categories.slice(0, 6).map((cat) => {
                const spent = transactions
                  .filter(t => t.type === 'expense' && t.category === cat.name)
                  .reduce((acc, t) => acc + Number(t.amount || 0), 0) || (cat.name === 'Food' ? 8650 : cat.name === 'House' ? 14700 : cat.name === 'EMI' ? 12500 : 1200);

                const percent = Math.min(Math.round((spent / cat.budget) * 100), 100);

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#111827] flex items-center gap-1.5">
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </span>
                      <span className="font-semibold text-[#6B7280]">
                        ₹{spent.toLocaleString('en-IN')} / ₹{cat.budget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent > 90 ? 'bg-[#EF4444]' : percent > 75 ? 'bg-[#F59E0B]' : 'bg-[#2E7D32]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!isFamilyMode && (
            <button
              onClick={() => setActiveTab('budget')}
              className="w-full mt-4 h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs font-bold hover:bg-[#E5E7EB]/40 transition"
            >
              Manage Category Budgets
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
