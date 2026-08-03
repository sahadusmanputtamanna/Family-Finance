export const INITIAL_FAMILY_MEMBERS = [
  { id: 'mem-1', name: 'Bava', gender: 'Male', status: 'Active' },
  { id: 'mem-2', name: 'Monutty', gender: 'Male', status: 'Active' },
  { id: 'mem-3', name: 'Cherimoon', gender: 'Male', status: 'Active' },
  { id: 'mem-4', name: 'Moolu', gender: 'Female', status: 'Active' },
  { id: 'mem-5', name: 'Cherimool', gender: 'Female', status: 'Active' },
  { id: 'mem-6', name: 'Mulla', gender: 'Female', status: 'Active' },
  { id: 'mem-7', name: 'Sinu', gender: 'Female', status: 'Active' }
];

export const INITIAL_MEMBERS = [
  { id: 'usr-1', name: 'Admin', role: 'Admin', avatar: '👤', isYou: true }
];

export const INITIAL_CATEGORIES = [];

export const INITIAL_INCOME_SOURCES = [
  '💼 Salary',
  '💰 Business',
  '🤝 Debt'
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-101',
    type: 'income',
    amount: 65000,
    source: '💼 Salary',
    member: 'Bava',
    receivedBy: 'Family Account',
    addedBy: 'Admin',
    date: '2026-08-01',
    notes: 'Monthly Company Salary Credited',
    attachmentName: 'Salary_Slip_Aug2026.pdf',
    attachmentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop'
  },
  {
    id: 'tx-102',
    type: 'income',
    amount: 20000,
    source: '💰 Business',
    member: 'Monutty',
    receivedBy: 'Family Account',
    addedBy: 'Admin',
    date: '2026-08-02',
    notes: 'Freelance Client Payment',
    attachmentName: null,
    attachmentUrl: null
  },
  {
    id: 'tx-103',
    type: 'expense',
    amount: 8650,
    category: 'Grocery',
    member: 'Moolu',
    paidBy: 'Family Member',
    addedBy: 'Admin',
    date: '2026-08-02',
    paymentMethod: 'UPI',
    notes: 'Monthly Family Grocery Purchase at Supermarket',
    attachmentName: 'Grocery_Receipt_Aug2.jpg',
    attachmentUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop'
  },
  {
    id: 'tx-104',
    type: 'expense',
    amount: 2450,
    category: 'Electricity Bill',
    member: 'Cherimoon',
    paidBy: 'Family Member',
    addedBy: 'Admin',
    date: '2026-08-01',
    paymentMethod: 'UPI',
    notes: 'Electricity Bill Paid via GPay',
    attachmentName: 'KSEB_Receipt.pdf',
    attachmentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop'
  },
  {
    id: 'tx-105',
    type: 'expense',
    amount: 3200,
    category: 'Fuel',
    member: 'Bava',
    paidBy: 'Family Member',
    addedBy: 'Admin',
    date: '2026-08-01',
    paymentMethod: 'Card',
    notes: 'Car Full Tank Fuel Fill',
    attachmentName: null,
    attachmentUrl: null
  },
  {
    id: 'tx-106',
    type: 'expense',
    amount: 12500,
    category: 'House Loan Installment',
    member: 'Cherimool',
    paidBy: 'Family Member',
    addedBy: 'Admin',
    date: '2026-07-28',
    paymentMethod: 'Bank',
    notes: 'Home Loan Auto-Debit Installment',
    attachmentName: null,
    attachmentUrl: null
  },
  {
    id: 'tx-107',
    type: 'expense',
    amount: 14700,
    category: 'House Maintenance',
    member: 'Sinu',
    paidBy: 'Family Member',
    addedBy: 'Admin',
    date: '2026-07-25',
    paymentMethod: 'Bank',
    notes: 'House Maintenance & Repair Work',
    attachmentName: 'Invoice_Hardware.jpg',
    attachmentUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop'
  }
];

export const INITIAL_BILLS = [
  { id: 'bill-1', category: 'Electricity Bill', icon: '💡', name: 'Electricity Bill', amount: 2450, dueDate: '2026-08-10', status: 'Paid', paidBy: 'Admin' },
  { id: 'bill-2', category: 'Water Supply', icon: '💧', name: 'Water Supply Bill', amount: 650, dueDate: '2026-08-15', status: 'Pending', paidBy: null },
  { id: 'bill-3', category: 'Broadband', icon: '🌐', name: 'Broadband Internet', amount: 999, dueDate: '2026-08-05', status: 'Pending', paidBy: null }
];

export const INITIAL_GOALS = [];

export const INITIAL_SETTINGS = {
  isPinLocked: false,
  pin: '1234',
  fingerprintEnabled: true,
  currencySymbol: '₹',
  monthlyBudgetLimit: 50000,
  notificationsEnabled: true
};
