import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  LayoutDashboard,
  Receipt,
  BarChart3,
  PieChart as PieChartIcon,
  BellRing,
  Target,
  ShieldCheck,
  LogOut,
  UserCheck,
  Lock
} from 'lucide-react';

export const AdminNavbar = () => {
  const {
    adminProfile,
    logoutAdmin,
    activeTab,
    setActiveTab,
    openAddModal,
    upcomingBillsCount,
    settings,
    setIsPinUnlocked,
    showToast
  } = useApp();

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: PieChartIcon },
    { id: 'bills', label: 'Bills', icon: BellRing, badge: upcomingBillsCount },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'admin', label: 'Admin Control', icon: ShieldCheck }
  ];

  const handleLock = () => {
    if (settings.isPinLocked) {
      setIsPinUnlocked(false);
      showToast('App Locked with PIN security', 'info');
    } else {
      showToast('Enable PIN Lock in Admin settings to lock the app', 'info');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E5E7EB] shadow-xs">
      
      {/* Top Admin Banner */}
      <div className="bg-[#111827] text-white px-4 py-1 text-center text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMINISTRATOR CONTROL PANEL
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Logged in as {adminProfile.name} &bull; Full CRUD privileges active
          </span>
          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition"
          >
            <LogOut className="w-3 h-3" />
            Logout Admin
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand (Left) */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D32] hover:bg-[#256D27] flex items-center justify-center text-white shadow-md transition-all duration-200 group-hover:scale-105">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-extrabold text-[#111827] tracking-tight leading-none">
                  Family<span className="text-[#2E7D32]">Finance</span>
                </h1>
                <span className="px-1.5 py-0.2 bg-[#2E7D32] text-white text-[9px] font-black rounded-md uppercase">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Hub Manager
              </span>
            </div>
          </div>

          {/* Navigation Items (Center - Desktop) */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2E7D32] text-white shadow-md shadow-emerald-900/10'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
                  <span>{item.label}</span>

                  {item.badge > 0 && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-[#2E7D32]' : 'bg-[#EF4444] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & Admin Profile (Right) */}
          <div className="flex items-center gap-2">
            
            {/* Quick Action Add Buttons */}
            <button
              onClick={() => openAddModal('income')}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#2E7D32] border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              + Income
            </button>
            <button
              onClick={() => openAddModal('expense')}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2E7D32] text-white hover:bg-[#256D27] text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              + Expense
            </button>

            {/* Lock */}
            <button
              onClick={handleLock}
              className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
              title="Lock Application"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Profile Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-bold text-[#111827]">
              <span>{adminProfile.avatar}</span>
              <span className="hidden lg:inline">{adminProfile.name}</span>
            </div>

            {/* Logout */}
            <button
              onClick={logoutAdmin}
              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
