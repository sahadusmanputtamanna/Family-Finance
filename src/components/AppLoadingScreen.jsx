import React from 'react';
import { motion } from 'framer-motion';

export const AppLoadingScreen = ({ message = "Loading Family Finance..." }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#FFFFFF] flex flex-col items-center justify-center p-6 text-center select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated Green Wallet Logo Wrapper */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Emerald Halo */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.1, 0.35] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-36 h-36 rounded-full bg-[#2E7D32] blur-xl"
          />

          {/* Official Green Wallet Icon */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-28 h-28 rounded-[28px] bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] border border-emerald-400/40 shadow-2xl flex items-center justify-center p-2"
          >
            {/* SVG Inner Wallet Graphic with White ₹ Symbol */}
            <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-md">
              <g transform="translate(256, 256) scale(0.95)">
                <rect x="-130" y="-85" width="260" height="180" rx="36" fill="#1B5E20" />
                <path d="M-130,-85 L130,-85 C125,-120 70,-125 -110,-125 Z" fill="#66BB6A" opacity="0.95" />
                <circle cx="75" cy="5" r="18" fill="#E8F5E9" />
                <circle cx="75" cy="5" r="9" fill="#1B5E20" />
                <text x="-25" y="25" text-anchor="middle" dominant-baseline="middle" fill="#FFFFFF" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="105px">₹</text>
              </g>
            </svg>
          </motion.div>
        </div>

        {/* Loading Spinner & Label */}
        <div className="space-y-3 pt-2 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-[#2E7D32] border-t-transparent rounded-full"
            />
            <span className="text-sm font-extrabold text-[#111827] tracking-tight">
              Family<span className="text-[#2E7D32]">Finance</span>
            </span>
          </div>

          <p className="text-xs font-bold text-[#6B7280]">
            {message}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
