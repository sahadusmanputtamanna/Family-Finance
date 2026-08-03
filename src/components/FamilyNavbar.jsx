import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Wifi,
  WifiOff,
  LayoutDashboard,
  Receipt,
  BarChart3,
  PieChart as PieChartIcon,
  BellRing,
  Target
} from 'lucide-react';

export const FamilyNavbar = () => {
  const {
    activeTab,
    setActiveTab,
    isOffline,
    upcomingBillsCount
  } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: PieChartIcon },
    { id: 'bills', label: 'Bills', icon: BellRing, badge: upcomingBillsCount },
    { id: 'goals', label: 'Goals', icon: Target }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E5E7EB] shadow-xs">
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

          {/* Right Status Indicator (Clean public view, NO ADMIN BUTTONS AT ALL) */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isOffline
                  ? 'bg-amber-50 text-[#F59E0B] border-amber-200'
                  : 'bg-emerald-50 text-[#2E7D32] border-emerald-200'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              {isOffline ? 'Offline' : 'Live Data'}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
