import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Toast = () => {
  const { toastMessage } = useApp();
  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const styleConfigs = {
    success: 'bg-[#FFFFFF] border-[#22C55E] text-[#111827] shadow-premium-lg',
    error: 'bg-[#FFFFFF] border-[#EF4444] text-[#111827] shadow-premium-lg',
    info: 'bg-[#FFFFFF] border-[#3B82F6] text-[#111827] shadow-premium-lg',
    warning: 'bg-[#FFFFFF] border-[#F59E0B] text-[#111827] shadow-premium-lg'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#3B82F6] shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0" />
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-l-4 border-y border-r border-[#E5E7EB] ${styleConfigs[type] || styleConfigs.info}`}
      >
        {icons[type] || icons.info}
        <p className="text-xs font-bold text-[#111827] flex-1">{message}</p>
      </motion.div>
    </div>
  );
};
