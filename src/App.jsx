import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Wallet } from 'lucide-react';
import { PublicDashboard } from './components/PublicDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { NotificationDropdown } from './components/NotificationDropdown';
import { Toast } from './components/Toast';

const AppContent = () => {
  const { currentPath, navigate } = useApp();

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-[#2E7D32] selection:text-white transition-colors duration-200">
      
      {/* Sticky Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E5E7EB] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Area (Left) */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#2E7D32] group-hover:bg-[#256D27] flex items-center justify-center text-white shadow-md transition">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-[#111827] tracking-tight leading-none">
                  Family<span className="text-[#2E7D32]">Finance</span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                  HOUSEHOLD FINANCE
                </span>
              </div>
            </div>

            {/* Top Navigation Right Controls */}
            <div className="flex items-center gap-3">
              {/* Notification Bell Icon rendered ONLY on Public View */}
              {!isAdminRoute && <NotificationDropdown />}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isAdminRoute ? <AdminPanel /> : <PublicDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-[#FFFFFF] py-4 text-center text-xs text-[#6B7280]">
        Family Finance &copy; {new Date().getFullYear()} &bull; Household Finance Management Website
      </footer>

      {/* Modals & Toasts */}
      <ReceiptViewerModal />
      <Toast />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
