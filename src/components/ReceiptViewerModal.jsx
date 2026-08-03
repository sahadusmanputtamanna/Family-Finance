import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ExternalLink, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReceiptViewerModal = () => {
  const { receiptModalUrl, setReceiptModalUrl, receiptModalTitle, setReceiptModalTitle } = useApp();

  if (!receiptModalUrl) return null;

  const handleClose = () => {
    setReceiptModalUrl(null);
    setReceiptModalTitle('');
  };

  const isPdf = receiptModalTitle.toLowerCase().endsWith('.pdf') || receiptModalUrl.includes('.pdf');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-[24px] overflow-hidden shadow-2xl border border-[#E5E7EB] flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2E7D32]" />
            <h3 className="font-bold text-[#111827] text-sm truncate max-w-xs">
              {receiptModalTitle || 'Attached Receipt'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={receiptModalUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/50 transition"
              title="Open full view"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-[#F8FAFC] min-h-[300px]">
          {isPdf ? (
            <iframe
              src={receiptModalUrl}
              title="PDF Receipt"
              className="w-full h-[500px] rounded-2xl border border-[#E5E7EB]"
            />
          ) : (
            <img
              src={receiptModalUrl}
              alt="Receipt Attachment"
              className="max-w-full max-h-[70vh] object-contain rounded-2xl border border-[#E5E7EB] shadow-md"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#E5E7EB] flex justify-between items-center bg-[#F8FAFC]">
          <span className="text-xs text-[#6B7280]">Verified Receipt Document</span>
          <a
            href={receiptModalUrl}
            download={receiptModalTitle || 'Receipt.jpg'}
            className="flex items-center gap-2 h-[40px] px-4 bg-[#2E7D32] hover:bg-[#256D27] text-white rounded-[12px] text-xs font-bold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download File
          </a>
        </div>

      </motion.div>
    </div>
  );
};
