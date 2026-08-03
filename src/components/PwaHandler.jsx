import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, Download, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InstallPwaButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!deferredPrompt) return null;

  const handleInstall = async () => {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <button
      onClick={handleInstall}
      className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition text-xs font-extrabold flex items-center gap-1.5 shadow-xs"
      title="Install Family Finance App"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Install App</span>
    </button>
  );
};

export const PwaHandler = () => {
  const { loadNotifications, fetchSupabaseData, showToast } = useApp();

  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [checkingNetwork, setCheckingNetwork] = useState(false);

  // Continuous Network Listener & Offline Modal Handler
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast("Back Online", "success");
      if (fetchSupabaseData) fetchSupabaseData();
      if (loadNotifications) loadNotifications();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchSupabaseData, loadNotifications, showToast]);

  const handleTryAgain = async () => {
    setCheckingNetwork(true);
    await new Promise(res => setTimeout(res, 600));

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setIsOffline(false);
      showToast("Back Online", "success");
      if (fetchSupabaseData) fetchSupabaseData();
      if (loadNotifications) loadNotifications();
    } else {
      setIsOffline(true);
      showToast("Still offline. Please check your internet connection.", "error");
    }
    setCheckingNetwork(false);
  };

  return (
    <>
      {/* Fullscreen Offline Modal */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#FFFFFF] flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-white border border-[#E5E7EB] rounded-[28px] p-8 shadow-2xl space-y-6 flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 text-[#EF4444] flex items-center justify-center shadow-xs">
                <WifiOff className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#111827] tracking-tight">
                  No Internet Connection
                </h2>
                <p className="text-xs font-semibold text-[#6B7280] leading-relaxed">
                  Internet is required to use Family Finance.
                </p>
              </div>

              <button
                onClick={handleTryAgain}
                disabled={checkingNetwork}
                className="w-full h-[48px] rounded-[16px] bg-[#2E7D32] hover:bg-[#256D27] active:scale-95 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkingNetwork ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
