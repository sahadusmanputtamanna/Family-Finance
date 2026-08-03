import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Lock,
  Wifi,
  WifiOff,
  LayoutDashboard,
  Receipt,
  BarChart3,
  PieChart as PieChartIcon,
  BellRing,
  Target,
  ShieldCheck,
  Bell,
  Eye,
  Share2,
  LogOut,
  UserCheck
} from 'lucide-react';

export const Navbar = () => {
  const {
    adminProfile,
    isFamilyMode,
    setIsFamilyMode,
    setIsShareModalOpen,
    activeTab,
    setActiveTab,
    isOffline,
    settings,
    setIsPinUnlocked,
    upcomingBillsCount,
    showToast
  } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: PieChartIcon },
    { id: 'bills', label: 'Bills', icon: BellRing, badge: upcomingBillsCount },
    { id: 'goals', label: 'Goals', icon: Target },
    ...(!isFamilyMode ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : [])
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
      
      {/* Top Banner when in Family Read-Only Mode */}
      {isFamilyMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 font-bold">
            <Eye className="w-4 h-4 text-amber-600" />
            Family Access (Read-Only Mode)
          </span>
          <span className="hidden sm:inline text-amber-600 font-normal">
            &bull; Editing, deleting, and settings are restricted
          </span>
          <button
            onClick={() => {
              setIsFamilyMode(false);
              showToast('Switched to Admin Mode (Full Access)', 'success');
            }}
            className="ml-2 px-2.5 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-md text-[11px] font-bold transition"
          >
            Switch to Admin Mode
          </button>
        </div>
      )}

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
              <h1 className="text-lg font-extrabold text-[#111827] tracking-tight leading-none">
                Family<span className="text-[#2E7D32]">Finance</span>
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Hub
              </span>
            </div>
          </div>

          {/* Navigation Items (Center - Desktop) */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2E7D32] text-white shadow-md shadow-emerald-900/10'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
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

          {/* Controls & Single Admin Profile (Right) */}
          <div className="flex items-center gap-2.5">
            
            {/* Share Family Access Link Button (For Admin) */}
            {!isFamilyMode && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#2E7D32] border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition"
                title="Share Family Read-Only Link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Family Access</span>
              </button>
            )}

            {/* Sync Status Badge */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isOffline
                  ? 'bg-amber-50 text-[#F59E0B] border-amber-200'
                  : 'bg-emerald-50 text-[#2E7D32] border-emerald-200'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              {isOffline ? 'Offline' : 'Synced'}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('bills')}
              className="relative p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
              title="Notifications & Reminders"
            >
              <Bell className="w-4 h-4" />
              {upcomingBillsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
              )}
            </button>

            {/* Single Admin Profile Display (NO DROPDOWN SWITCHER) */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-bold text-[#111827]">
              <span>{adminProfile.avatar}</span>
              <span className="truncate">{adminProfile.name}</span>
              <span className="text-[10px] bg-[#2E7D32] text-white px-2 py-0.5 rounded-full font-bold">
                {isFamilyMode ? 'Viewer' : 'Admin'}
              </span>
            </div>

            {/* Lock App */}
            {!isFamilyMode && (
              <button
                onClick={handleLock}
                className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
                title="Lock Application"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
