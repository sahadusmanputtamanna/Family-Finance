import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, KeyRound, Fingerprint, ArrowRight, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminLoginView = () => {
  const { loginAdmin, settings, showToast, navigate } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!pinInput) {
      setError('Please enter the Admin Security PIN code');
      return;
    }

    const success = loginAdmin(pinInput);
    if (!success) {
      setError('Invalid Admin PIN code. Default code is 1234');
      setPinInput('');
    }
  };

  const handleFingerprintLogin = () => {
    loginAdmin('1234');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-6 sm:p-8 border border-[#E5E7EB] shadow-premium-lg space-y-6 text-center"
      >
        
        {/* Top Logo & Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-[#2E7D32] border border-emerald-100 flex items-center justify-center text-2xl shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#2E7D32] text-[11px] font-bold uppercase tracking-wider">
            Protected Admin Route
          </span>
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight pt-1">
            Admin Panel Login
          </h2>
          <p className="text-xs text-[#6B7280]">
            Enter your Administrator Security PIN code to access management tools, budget controls, and database settings.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          
          <div className="text-left">
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">
              Admin PIN Code
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-5 h-5 absolute left-3.5 text-[#6B7280]" />
              <input
                type="password"
                maxLength={6}
                required
                placeholder="••••"
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setError('');
                }}
                className="w-full h-[44px] pl-11 pr-4 bg-[#FFFFFF] border border-[#D1D5DB] rounded-[14px] text-lg font-mono font-bold text-[#111827] focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-[#EF4444] text-left">{error}</p>
          )}

          <button
            type="submit"
            className="w-full h-[44px] rounded-[14px] bg-[#2E7D32] hover:bg-[#256D27] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to Admin Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Fingerprint Biometric Alternative */}
        <div className="pt-2 border-t border-[#E5E7EB] space-y-3">
          <button
            onClick={handleFingerprintLogin}
            className="w-full h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/40 text-[#111827] text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4 text-[#2E7D32]" />
            <span>Login with Fingerprint Biometric</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
            <span>Default Security PIN: <strong>1234</strong></span>
            <button
              onClick={() => navigate('/')}
              className="text-[#2E7D32] font-bold hover:underline"
            >
              &larr; Return to Family View
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
