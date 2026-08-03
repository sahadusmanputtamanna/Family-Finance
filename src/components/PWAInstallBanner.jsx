import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

export const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { showToast } = useApp();

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('App installed on home screen!', 'success');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      showToast('To install: Open browser menu & tap "Add to Home Screen"', 'info');
    }
  };

  if (isDismissed || isInstalled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] p-4 rounded-[20px] shadow-premium mb-6 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center shrink-0 border border-emerald-100">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-[#111827]">Install Mobile App (PWA)</h4>
          <p className="text-[11px] text-[#6B7280]">
            Access your family finance hub directly from your phone's home screen!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="h-[38px] px-4 bg-[#2E7D32] hover:bg-[#256D27] text-white rounded-[12px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Install
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-[#6B7280] hover:text-[#111827]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
