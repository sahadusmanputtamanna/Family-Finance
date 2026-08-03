import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, Download, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
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
  const [swUpdateWaiting, setSwUpdateWaiting] = useState(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [checkingNetwork, setCheckingNetwork] = useState(false);

  // 1. Continuous Network Listener & Offline Modal Handler
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

  // 2. Service Worker Auto Update Detection
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwUpdateWaiting(newWorker);
                setShowUpdateBanner(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdateNow = () => {
    if (swUpdateWaiting) {
      swUpdateWaiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdateBanner(false);
    window.location.reload();
  };

  return (
    <>
      {/* Fullscreen Offline Modal (Strict Requirement) */}
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

      {/* Auto-Update Banner */}
      <AnimatePresence>
        {showUpdateBanner && !isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 bg-[#111827] text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-md"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2E7D32] text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">A new version is available.</h4>
                <p className="text-[10px] text-slate-300">Update now to get the latest features.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleUpdateNow}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-[#2E7D32] text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update Now</span>
              </button>
              <button
                onClick={() => setShowUpdateBanner(false)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
