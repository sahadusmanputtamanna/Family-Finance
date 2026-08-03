import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Paperclip,
  Trash2,
  Edit2,
  Calendar,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const TransactionCard = ({ transaction }) => {
  const {
    isFamilyMode,
    deleteTransaction,
    openEditModal,
    setReceiptModalUrl,
    setReceiptModalTitle,
    familySettings
  } = useApp();

  const isIncome = transaction.type === 'income';
  const formattedAmount = Number(transaction.amount || 0).toLocaleString('en-IN');

  const handleOpenReceipt = (e) => {
    e.stopPropagation();
    if (transaction.attachmentUrl) {
      setReceiptModalUrl(transaction.attachmentUrl);
      setReceiptModalTitle(transaction.attachmentName || 'Receipt Attachment');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 shadow-premium hover:shadow-premium-md transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        
        {/* Left Direction & Expense Name */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
              isIncome
                ? 'bg-emerald-50 text-[#2E7D32] border border-emerald-100'
                : 'bg-rose-50 text-[#EF4444] border border-rose-100'
            }`}
          >
            {isIncome ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Display Expense Name or Income Source */}
              <h4 className="font-bold text-sm text-[#111827] truncate">
                {isIncome ? transaction.source : transaction.category}
              </h4>

              {/* Selected Family Member Badge */}
              {transaction.member && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#2E7D32] border border-emerald-100">
                  {transaction.member}
                </span>
              )}
            </div>

            <p className="text-xs text-[#6B7280] truncate mt-0.5">
              {transaction.notes || (isIncome ? 'Income credited' : 'Expense record')}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#6B7280]" />
                {transaction.date}
              </span>
            </div>
          </div>
        </div>

        {/* Right Amount & Actions */}
        <div className="flex flex-col items-end shrink-0">
          <span
            className={`text-base sm:text-lg font-extrabold ${
              isIncome ? 'text-[#22C55E]' : 'text-[#EF4444]'
            }`}
          >
            {isIncome ? '+' : '-'} {familySettings.currency}{formattedAmount}
          </span>

          <div className="flex items-center gap-1 mt-1.5">
            {transaction.attachmentUrl && (
              <button
                onClick={handleOpenReceipt}
                className="p-1.5 rounded-lg bg-emerald-50 text-[#2E7D32] hover:bg-emerald-100 transition"
                title="View Receipt Attachment"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
            )}

            {!isFamilyMode && (
              <>
                <button
                  onClick={() => openEditModal(transaction)}
                  className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] transition"
                  title="Edit Record"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteTransaction(transaction.id)}
                  className="p-1.5 rounded-lg bg-rose-50 text-[#EF4444] hover:bg-rose-100 transition"
                  title="Delete Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
};
