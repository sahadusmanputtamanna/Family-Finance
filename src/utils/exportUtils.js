import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatDisplayDate } from './dateFormat';

export const exportToPDF = (transactions = [], familyCurrency = '₹') => {
  try {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(46, 125, 50);
    doc.text('Family Finance Hub - Statement Report', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated on: ${formatDisplayDate(new Date())}`, 14, 28);
    doc.text(`Total Records: ${transactions.length}`, 14, 34);

    const tableRows = transactions.map(t => [
      formatDisplayDate(t.date),
      t.type === 'income' ? 'Income' : 'Expense',
      t.type === 'income' ? t.source : t.category,
      t.member || 'N/A',
      `Rs. ${Number(t.amount).toLocaleString('en-IN')}`,
      t.notes || ''
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Date', 'Type', 'Category/Source', 'Family Member', 'Amount', 'Notes']],
      body: tableRows,
      headStyles: { fillColor: [46, 125, 50] },
      styles: { fontSize: 8 }
    });

    doc.save(`Family_Finance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (e) {
    console.error('PDF export error:', e);
  }
};

export const exportToExcel = (transactions = []) => {
  try {
    const data = transactions.map(t => ({
      Date: formatDisplayDate(t.date),
      Type: t.type.toUpperCase(),
      CategoryOrSource: t.type === 'income' ? t.source : t.category,
      FamilyMember: t.member || 'N/A',
      Amount: Number(t.amount),
      PaymentMethod: t.paymentMethod || 'N/A',
      Notes: t.notes
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `Family_Finance_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (e) {
    console.error('Excel export error:', e);
  }
};

export const exportToCSV = (transactions = []) => {
  try {
    const headers = ['Date,Type,Category,FamilyMember,Amount,Notes'];
    const rows = transactions.map(t => 
      `"${formatDisplayDate(t.date)}","${t.type}","${t.type === 'income' ? t.source : t.category}","${t.member || 'N/A'}",${t.amount},"${(t.notes || '').replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Family_Finance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error('CSV export error:', e);
  }
};
