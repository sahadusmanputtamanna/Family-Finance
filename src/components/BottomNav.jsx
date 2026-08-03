import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Receipt, Plus, BarChart3, Settings } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab, onOpenAdd }) => {
  const { isFamilyMode } = useApp();

  const navs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    ...(!isFamilyMode ? [{ id: 'add', label: 'Add', isFab: true }] : []),
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[#E5E7EB] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {navs.map((item) => {
          if (item.isFab) {
            return (
              <div key="fab" className="relative -top-5">
                <button
                  onClick={onOpenAdd}
                  className="w-14 h-14 rounded-full bg-[#2E7D32] hover:bg-[#256D27] text-white shadow-lg flex items-center justify-center transform active:scale-95 transition-transform border-4 border-[#FFFFFF]"
                  aria-label="Add Transaction"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-[#2E7D32] font-bold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
