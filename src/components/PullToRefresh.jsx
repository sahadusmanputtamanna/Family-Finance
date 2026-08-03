import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { RefreshCw, ArrowDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PullToRefresh = ({ children }) => {
  const { fetchSupabaseData, showToast } = useApp();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const touchStartRef = useRef(0);
  const isPullingRef = useRef(false);
  const threshold = 70; // Threshold in px to trigger refresh

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Only initiate pull-to-refresh if window is scrolled to top
      if (window.scrollY <= 2) {
        touchStartRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      } else {
        isPullingRef.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPullingRef.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartRef.current;

      // Only pull down if window remains at top and delta is positive
      if (window.scrollY <= 2 && deltaY > 0) {
        // Apply rubber-band damping friction
        const distance = Math.min(95, deltaY * 0.42);
        setPullDistance(distance);

        // Prevent native overscroll browser refresh when pulling past 20px
        if (distance > 20 && e.cancelable) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      if (pullDistance >= threshold && !isRefreshing) {
        // Check internet connection before refreshing
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setPullDistance(0);
          showToast("No internet connection to refresh", "error");
          return;
        }

        setIsRefreshing(true);
        setPullDistance(threshold);

        try {
          // Perform silent background refresh of all Supabase data
          if (fetchSupabaseData) {
            await fetchSupabaseData(false);
          }
          setRefreshSuccess(true);
          setTimeout(() => setRefreshSuccess(false), 1200);
        } catch (err) {
          console.error("Pull-to-refresh error:", err);
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 400);
        }
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, fetchSupabaseData, showToast]);

  const progressRatio = Math.min(1, pullDistance / threshold);

  return (
    <div className="relative min-h-screen">
      {/* Top Pull-to-Refresh Indicator Container */}
      <AnimatePresence>
        {(pullDistance > 10 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: pullDistance - 50 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-3 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="w-11 h-11 rounded-full bg-white border border-[#E5E7EB] shadow-xl flex items-center justify-center text-[#2E7D32]">
              {isRefreshing ? (
                refreshSuccess ? (
                  <Check className="w-5 h-5 text-[#2E7D32]" />
                ) : (
                  <RefreshCw className="w-5 h-5 animate-spin text-[#2E7D32]" />
                )
              ) : (
                <ArrowDown
                  className="w-5 h-5 text-[#2E7D32] transition-transform duration-150"
                  style={{ transform: `rotate(${progressRatio * 180}deg)` }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Content Wrapper */}
      <div
        style={{
          transform: isRefreshing ? `translateY(${threshold * 0.4}px)` : `translateY(${pullDistance * 0.35}px)`,
          transition: isRefreshing ? 'transform 0.2s cubic-bezier(0,0,0.2,1)' : pullDistance === 0 ? 'transform 0.25s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};
