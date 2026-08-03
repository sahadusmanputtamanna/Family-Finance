// ========================================================
// REALTIME SERVICE: Supabase Realtime Multi-Table Subscription Manager
// Listens to: income, expenses, family_members, notifications
// ========================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

class RealtimeService {
  constructor() {
    this.channel = null;
  }

  subscribeToAllTables(onDataChangeCallback, onNotificationCallback) {
    if (!isSupabaseConfigured()) return null;

    try {
      if (this.channel) {
        try { supabase.removeChannel(this.channel); } catch (e) {}
      }

      // Order: .on() chained BEFORE .subscribe()
      this.channel = supabase
        .channel('app_realtime_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'income' },
          (payload) => {
            console.log('[RealtimeService] Income table postgres_change:', payload);
            if (onDataChangeCallback) onDataChangeCallback('income', payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses' },
          (payload) => {
            console.log('[RealtimeService] Expenses table postgres_change:', payload);
            if (onDataChangeCallback) onDataChangeCallback('expenses', payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'family_members' },
          (payload) => {
            console.log('[RealtimeService] Family members table postgres_change:', payload);
            if (onDataChangeCallback) onDataChangeCallback('family_members', payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          (payload) => {
            console.log('[RealtimeService] Notifications table postgres_change:', payload);
            if (onNotificationCallback) onNotificationCallback(payload);
          }
        );

      this.channel.subscribe((status, err) => {
        console.log('[RealtimeService] Realtime channel status:', status);
        if (err) console.error('[RealtimeService] Realtime subscription error:', err);
      });

      return this.channel;
    } catch (err) {
      console.warn('[RealtimeService] Realtime channel setup exception:', err);
      return null;
    }
  }

  // Alias for backward compatibility
  subscribeToNotifications(onNotificationCallback) {
    return this.subscribeToAllTables(null, onNotificationCallback);
  }

  unsubscribe() {
    if (this.channel && isSupabaseConfigured()) {
      try {
        supabase.removeChannel(this.channel);
        this.channel = null;
      } catch (e) {}
    }
  }
}

export const realtimeService = new RealtimeService();
