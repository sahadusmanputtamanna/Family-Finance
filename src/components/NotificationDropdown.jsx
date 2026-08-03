import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  X,
  ArrowDownRight,
  ArrowUpRight,
  Paperclip,
  Trash2,
  ChevronRight,
  Clock,
  Loader2,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export const NotificationDropdown = () => {
  // SINGLE SOURCE OF TRUTH: Notifications directly from AppContext
  const {
    notifications,
    markAllNotificationsAsRead,
    deleteNotification
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const dropdownRef = useRef(null);

  // Unread badge calculated dynamically directly from notifications array
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const latestTen = notifications.slice(0, 10);

  // AUTO MARK AS READ:
  // When dropdown opens and there are unread notifications, automatically mark all as read
  useEffect(() => {
    if (isOpen && unreadCount > 0 && !loadingAction) {
      markAllNotificationsAsRead();
    }
  }, [isOpen, unreadCount, markAllNotificationsAsRead, loadingAction]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Action Handlers
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (loadingAction) return;
    setLoadingAction(`delete-${id}`);
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error("handleDelete error:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'income':
        return <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0"><ArrowDownRight className="w-3.5 h-3.5" /></div>;
      case 'expense':
        return <div className="w-7 h-7 rounded-lg bg-rose-100 text-[#EF4444] flex items-center justify-center shrink-0"><ArrowUpRight className="w-3.5 h-3.5" /></div>;
      case 'receipt':
        return <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Paperclip className="w-3.5 h-3.5" /></div>;
      case 'monthly_report':
        return <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><PieChart className="w-3.5 h-3.5" /></div>;
      default:
        return <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><Bell className="w-3.5 h-3.5" /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-[#111827] hover:text-[#2E7D32] transition flex items-center justify-center focus:outline-none"
        aria-label="Notifications"
        title="Family Notifications"
      >
        <Bell className="w-[19px] h-[19px]" />
        
        {/* Unread Badge (Becomes 0 / hidden when opened) */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[15px] h-[15px] px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[320px] sm:w-[360px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[20px] shadow-2xl z-50 overflow-hidden"
          >
            {/* Header (Clean - Gear icon removed) */}
            <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xs text-[#111827]">
                  Family Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#2E7D32] text-[10px] font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-[360px] overflow-y-auto no-scrollbar divide-y divide-[#F1F5F9]">
              {latestTen.length === 0 ? (
                <div className="py-10 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#111827]">No notifications yet</p>
                  <span className="text-[10px] text-[#6B7280]">Recent income and expense activity will appear here</span>
                </div>
              ) : (
                latestTen.map(n => {
                  const isUnread = !n.is_read;
                  const displayBody = n.body || n.message || '';
                  const isItemLoading = loadingAction === `delete-${n.id}`;

                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 transition flex items-start gap-2.5 ${
                        isUnread ? 'bg-emerald-50/40' : 'hover:bg-[#F8FAFC]'
                      } ${isItemLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {getTypeIcon(n.type)}

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-[#111827] truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-[#6B7280] shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#6B7280]" />
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#6B7280] leading-relaxed line-clamp-2">
                          {displayBody}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-[#22C55E] ring-2 ring-emerald-100" />
                        )}

                        <button
                          onClick={(e) => handleDelete(n.id, e)}
                          disabled={!!loadingAction}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition opacity-60 hover:opacity-100 disabled:opacity-30"
                          title="Delete notification"
                        >
                          {loadingAction === `delete-${n.id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Simple Footer Layout (Keep ONLY View All action) */}
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center justify-between text-xs font-bold">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAllModal(true);
                }}
                className="text-[#2E7D32] hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View All Notifications Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[24px] p-5 border border-[#E5E7EB] shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">
                Family Notifications ({notifications.length})
              </h3>
              <button onClick={() => setShowAllModal(false)} className="p-1 text-[#6B7280] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border transition flex items-start justify-between gap-2.5 ${
                    !n.is_read ? 'bg-emerald-50/40 border-emerald-200' : 'bg-[#F8FAFC] border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {getTypeIcon(n.type)}
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-bold text-xs text-[#111827]">{n.title}</h4>
                      <p className="text-[11px] text-[#6B7280] leading-relaxed">{n.body || n.message}</p>
                      <span className="text-[9px] text-[#6B7280] block pt-0.5">{formatRelativeTime(n.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      disabled={!!loadingAction}
                      className="p-1 text-rose-500 hover:bg-rose-100 rounded disabled:opacity-40"
                      title="Delete notification"
                    >
                      {loadingAction === `delete-${n.id}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-end">
              <button
                onClick={() => setShowAllModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#2E7D32] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
