import React from 'react';
import { useApp } from '../context/AppContext';
import { X, AlertTriangle, Trash2, Eye, Calendar, DollarSign, Tag, CheckCircle2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const CmsModals = () => {
  const {
    viewDetailItem,
    setViewDetailItem,
    deleteConfirmItem,
    setDeleteConfirmItem,
    familyInfo
  } = useApp();

  if (!viewDetailItem && !deleteConfirmItem) return null;

  return (
    <>
      {/* 1. VIEW DETAIL MODAL */}
      {viewDetailItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#111827] text-base">Record Details</h3>
                  <span className="text-[11px] text-[#6B7280]">ID: {viewDetailItem.id}</span>
                </div>
              </div>
              <button
                onClick={() => setViewDetailItem(null)}
                className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content inspection */}
            <div className="space-y-3 text-xs">
              {Object.entries(viewDetailItem).map(([key, val]) => {
                if (key === 'id' || key === 'attachmentUrl' || val === null || val === undefined) return null;
                return (
                  <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="font-bold text-[#6B7280] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-[#111827] max-w-[200px] truncate text-right">
                      {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : key.toLowerCase().includes('amount') ? `${familyInfo.currency}${Number(val).toLocaleString('en-IN')}` : String(val)}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setViewDetailItem(null)}
              className="w-full h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-bold text-xs hover:bg-[#E5E7EB]/40 transition"
            >
              Close Details
            </button>
          </motion.div>
        </div>
      )}

      {/* 2. DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#FFFFFF] rounded-[24px] p-6 border border-[#E5E7EB] shadow-2xl space-y-4 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#EF4444] border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-[#111827] text-lg">Confirm Delete</h3>
              <p className="text-xs text-[#6B7280]">
                Are you sure you want to permanently delete <strong>{deleteConfirmItem.title || deleteConfirmItem.name || 'this record'}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 h-[44px] rounded-[14px] bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-bold text-xs hover:bg-[#E5E7EB]/40 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteConfirmItem.onConfirm();
                  setDeleteConfirmItem(null);
                }}
                className="flex-1 h-[44px] rounded-[14px] bg-[#EF4444] hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
              >
                Delete Record
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
