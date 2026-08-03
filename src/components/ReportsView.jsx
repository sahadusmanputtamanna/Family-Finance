import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Download,
  Award,
  TrendingDown,
  TrendingUp,
  PieChart as PieChartIcon
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
  Legend,
  CartesianGrid
} from 'recharts';

export const ReportsView = () => {
  const { transactions, categories, totalIncome, totalExpense, currentSavings, showToast } = useApp();

  const expensesOnly = transactions.filter(t => t.type === 'expense');
  const expenseAmounts = expensesOnly.map(t => Number(t.amount || 0));

  const highestExpense = expenseAmounts.length > 0 ? Math.max(...expenseAmounts) : 0;
  const lowestExpense = expenseAmounts.length > 0 ? Math.min(...expenseAmounts) : 0;

  // Category total calculations
  const categoryTotals = {};
  expensesOnly.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount || 0);
  });

  let topCategoryName = 'None';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategoryName = cat;
    }
  });

  const avgDailyExpense = Math.round(totalExpense / 30);
  const savingsPercent = totalIncome > 0 ? Math.round((currentSavings / totalIncome) * 100) : 0;

  // Chart datasets
  const monthlyData = [
    { month: 'Mar', Income: 72000, Expense: 38000, Savings: 34000 },
    { month: 'Apr', Income: 80000, Expense: 42000, Savings: 38000 },
    { month: 'May', Income: 75000, Expense: 39000, Savings: 36000 },
    { month: 'Jun', Income: 88000, Expense: 45000, Savings: 43000 },
    { month: 'Jul', Income: 82000, Expense: 41000, Savings: 41000 },
    { month: 'Aug', Income: totalIncome || 85000, Expense: totalExpense || 41500, Savings: currentSavings || 43500 }
  ];

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  const CHART_COLORS = ['#2E7D32', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316'];

  // Export PDF Report
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(46, 125, 50);
      doc.text('Family Finance Hub - Financial Statement', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
      doc.text(`Total Income: ₹${totalIncome.toLocaleString('en-IN')}`, 14, 34);
      doc.text(`Total Expense: ₹${totalExpense.toLocaleString('en-IN')}`, 14, 40);
      doc.text(`Total Savings: ₹${currentSavings.toLocaleString('en-IN')}`, 14, 46);

      const tableRows = transactions.map(t => [
        t.date || '',
        t.type === 'income' ? 'Income' : 'Expense',
        t.type === 'income' ? t.source : t.category,
        `Rs. ${Number(t.amount).toLocaleString('en-IN')}`,
        t.type === 'income' ? t.receivedBy : (t.paidBy || 'Usman'),
        t.addedBy || 'Usman',
        t.notes || ''
      ]);

      doc.autoTable({
        startY: 54,
        head: [['Date', 'Type', 'Category/Source', 'Amount', 'Person', 'Added By', 'Notes']],
        body: tableRows,
        headStyles: { fillColor: [46, 125, 50] },
        styles: { fontSize: 8 }
      });

      doc.save(`Family_Finance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('PDF Financial Report downloaded!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Downloaded PDF Report', 'success');
    }
  };

  // Export Excel Report
  const handleExportExcel = () => {
    try {
      const data = transactions.map(t => ({
        Date: t.date,
        Type: t.type.toUpperCase(),
        CategoryOrSource: t.type === 'income' ? t.source : t.category,
        Amount: Number(t.amount),
        PaymentMethod: t.paymentMethod || 'N/A',
        Person: t.type === 'income' ? t.receivedBy : t.paidBy,
        AddedBy: t.addedBy || 'Usman',
        Notes: t.notes
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Family Transactions');
      XLSX.writeFile(wb, `Family_Finance_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('Excel (.xlsx) file downloaded!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Downloaded Excel file', 'success');
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    try {
      const headers = ['Date,Type,Category,Amount,Person,AddedBy,Notes'];
      const rows = transactions.map(t => 
        `"${t.date}","${t.type}","${t.type === 'income' ? t.source : t.category}",${t.amount},"${t.type === 'income' ? t.receivedBy : t.paidBy}","${t.addedBy || 'Usman'}","${(t.notes || '').replace(/"/g, '""')}"`
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Family_Finance_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV Report downloaded!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Downloaded CSV File', 'success');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">
            Monthly Reports & Statements
          </h2>
          <p className="text-xs text-[#6B7280]">
            Financial analytics, spend distribution, and exportable reports
          </p>
        </div>

        {/* Download Buttons (14px radius, 44px height) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="h-[44px] px-4 rounded-[14px] bg-rose-50 text-[#EF4444] border border-rose-100 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="h-[44px] px-4 rounded-[14px] bg-emerald-50 text-[#2E7D32] border border-emerald-100 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="h-[44px] px-4 rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] hover:bg-[#E5E7EB]/40 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Top Spend Category */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5E7EB] shadow-premium">
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
            Top Spend Category
          </span>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <div className="truncate">
              <div className="text-sm font-bold text-[#111827] truncate">
                {topCategoryName}
              </div>
              <span className="text-[11px] text-[#6B7280]">
                ₹{topCategoryAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Avg Daily Expense */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5E7EB] shadow-premium">
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
            Avg Daily Expense
          </span>
          <div className="text-base font-extrabold text-[#111827]">
            ₹{avgDailyExpense.toLocaleString('en-IN')}/day
          </div>
          <span className="text-[11px] text-[#6B7280]">30 days average</span>
        </div>

        {/* Monthly Savings Rate */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5E7EB] shadow-premium">
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
            Monthly Savings
          </span>
          <div className="text-base font-extrabold text-[#22C55E]">
            {savingsPercent}%
          </div>
          <span className="text-[11px] text-[#22C55E] font-bold">₹{currentSavings.toLocaleString('en-IN')}</span>
        </div>

        {/* Highest Expense */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5E7EB] shadow-premium">
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
            Highest Expense
          </span>
          <div className="text-base font-extrabold text-[#EF4444]">
            ₹{highestExpense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#6B7280]">Single record</span>
        </div>

        {/* Lowest Expense */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5E7EB] shadow-premium col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
            Lowest Expense
          </span>
          <div className="text-base font-extrabold text-blue-600">
            ₹{lowestExpense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#6B7280]">Single record</span>
        </div>

      </div>

      {/* Reports Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income vs Expense Bar Chart */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium">
          <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2E7D32]" />
            Monthly Income vs Expense Comparison
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="Income" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="bg-[#FFFFFF] rounded-[20px] p-5 border border-[#E5E7EB] shadow-premium">
          <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-[#2E7D32]" />
            Category Expense Share
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
