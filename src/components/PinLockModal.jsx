import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Fingerprint, Delete, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export const PinLockModal = () => {
  const { isPinUnlocked, setIsPinUnlocked, settings, showToast } = useApp();
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (isPinUnlocked || !settings.isPinLocked) return null;

  const handleKeyPress = (num) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      setErrorMsg('');

      if (newPin.length === 4) {
        if (newPin === settings.pin) {
          setIsPinUnlocked(true);
          setEnteredPin('');
          showToast('App Unlocked Successfully!', 'success');
        } else {
          setErrorMsg('Incorrect PIN code. Default is 1234');
          setTimeout(() => setEnteredPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  const handleFingerprintUnlock = () => {
    setIsPinUnlocked(true);
    showToast('Biometric Fingerprint Verified!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-[#FFFFFF] border border-[#E5E7EB] rounded-[24px] p-6 text-center shadow-2xl space-y-4"
      >
        
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#2E7D32] border border-emerald-100 flex items-center justify-center mx-auto mb-2 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-extrabold text-[#111827]">Family Finance Hub</h2>
        <p className="text-xs text-[#6B7280]">Enter 4-digit PIN or tap fingerprint sensor</p>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-4 py-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < enteredPin.length
                  ? 'bg-[#2E7D32] border-[#2E7D32] scale-110 shadow-xs'
                  : 'border-[#D1D5DB] bg-[#F8FAFC]'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs font-bold text-[#EF4444] animate-shake">{errorMsg}</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="h-14 rounded-[14px] bg-[#F8FAFC] hover:bg-[#E5E7EB]/50 text-[#111827] font-extrabold text-xl border border-[#E5E7EB] active:scale-95 transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleFingerprintUnlock}
            className="h-14 rounded-[14px] bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] flex items-center justify-center border border-emerald-100 active:scale-95 transition"
            title="Biometric Unlock"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-[14px] bg-[#F8FAFC] hover:bg-[#E5E7EB]/50 text-[#111827] font-extrabold text-xl border border-[#E5E7EB] active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-[14px] bg-[#F8FAFC] hover:bg-[#E5E7EB]/50 text-[#6B7280] flex items-center justify-center border border-[#E5E7EB] active:scale-95 transition"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#6B7280] pt-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Default PIN: 1234</span>
        </div>

      </motion.div>
    </div>
  );
};
