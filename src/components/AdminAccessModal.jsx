import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminAccessModal = ({ isOpen, onClose }) => {
  const { loginAdmin, navigate } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input & handle Escape key navigation
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setIsShaking(false);
      
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Incorrect password.');
      triggerShake();
      return;
    }

    setError('');
    setLoading(true);

    // Call loginAdmin with suppressToast=true so custom inline error handles UI feedback
    const success = await loginAdmin(password, undefined, true);
    setLoading(false);

    if (success) {
      onClose();
      setPassword('');
      navigate('/admin');
    } else {
      setError('Incorrect password.');
      setPassword('');
      triggerShake();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: isShaking ? [-10, 10, -8, 8, -4, 4, 0] : 0
          }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: isShaking ? 0.4 : 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#FFFFFF] border border-[#E5E7EB] rounded-[24px] p-6 sm:p-8 shadow-2xl space-y-6 text-left relative"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon & Title Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2E7D32] border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0 pr-6">
              <h3 className="text-lg font-extrabold text-[#111827] tracking-tight">
                Administrator Access
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Enter the administrator password to continue.
              </p>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B7280]">
                Password *
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-[#6B7280]" />
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter admin password"
                  className="w-full h-[44px] pl-10 pr-10 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-xs font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#6B7280] hover:text-[#111827] p-1 rounded transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Red Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-[#EF4444] bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Dialog Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-[42px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-slate-100 text-[#111827] font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 h-[42px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
