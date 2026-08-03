import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, Eye, QrCode, Share2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const FamilyAccessModal = () => {
  const { isShareModalOpen, setIsShareModalOpen, setIsFamilyMode, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen) return null;

  const familyAccessUrl = `${window.location.origin}/?mode=family`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(familyAccessUrl);
    setCopied(true);
    showToast('Family Access Read-Only link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSwitchToFamilyView = () => {
    setIsFamilyMode(true);
    setIsShareModalOpen(false);
    showToast('Switched to Family Read-Only View', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-5"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center border border-emerald-100">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#111827] text-base">Family Read-Only Access</h3>
              <p className="text-xs text-[#6B7280]">Share financial summary with family members</p>
            </div>
          </div>
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl text-xs space-y-1 text-[#6B7280]">
          <div className="flex items-center gap-1.5 font-bold text-[#111827]">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            Read-Only Security Guarantee
          </div>
          <p className="text-[11px] leading-relaxed">
            Family members opening this link can view balances, reports, and charts, but <strong>cannot add, edit, or delete any transactions or settings</strong>.
          </p>
        </div>

        {/* QR Code Graphic Simulation */}
        <div className="p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl text-center space-y-2">
          <div className="w-36 h-36 mx-auto bg-white border-4 border-[#2E7D32] p-2 rounded-2xl flex items-center justify-center shadow-xs">
            {/* SVG Simulated QR Code */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#111827]" fill="currentColor">
              <rect x="0" y="0" width="30" height="30" fill="#2E7D32" />
              <rect x="5" y="5" width="20" height="20" fill="#FFFFFF" />
              <rect x="10" y="10" width="10" height="10" fill="#2E7D32" />
              
              <rect x="70" y="0" width="30" height="30" fill="#2E7D32" />
              <rect x="75" y="5" width="20" height="20" fill="#FFFFFF" />
              <rect x="80" y="10" width="10" height="10" fill="#2E7D32" />
              
              <rect x="0" y="70" width="30" height="30" fill="#2E7D32" />
              <rect x="5" y="75" width="20" height="20" fill="#FFFFFF" />
              <rect x="10" y="80" width="10" height="10" fill="#2E7D32" />

              <rect x="40" y="10" width="10" height="10" fill="#2E7D32" />
              <rect x="50" y="20" width="10" height="10" fill="#2E7D32" />
              <rect x="30" y="40" width="20" height="20" fill="#2E7D32" />
              <rect x="60" y="50" width="20" height="10" fill="#2E7D32" />
              <rect x="40" y="70" width="10" height="20" fill="#2E7D32" />
              <rect x="80" y="80" width="10" height="10" fill="#2E7D32" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-[#6B7280] block">
            Scan with phone camera for instant read-only access
          </span>
        </div>

        {/* Copyable Link */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#6B7280]">Shareable Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={familyAccessUrl}
              className="flex-1 h-[44px] px-3 bg-[#F8FAFC] border border-[#D1D5DB] rounded-[14px] text-xs font-mono text-[#111827]"
            />
            <button
              onClick={handleCopyLink}
              className="h-[44px] px-4 bg-[#2E7D32] hover:bg-[#256D27] text-white rounded-[14px] text-xs font-bold shrink-0 transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Action Preview Button */}
        <button
          onClick={handleSwitchToFamilyView}
          className="w-full h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#E5E7EB]/40 text-[#111827] text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4 text-[#2E7D32]" />
          Preview Family Read-Only Dashboard
        </button>

      </motion.div>
    </div>
  );
};
