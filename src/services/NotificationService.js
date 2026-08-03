// ========================================================
// NOTIFICATION SERVICE: Simple Unified Architecture Dispatcher
// Integrates RealtimeService, PushNotificationService & FirebaseService
// ========================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { pushNotificationService } from './PushNotificationService';
import { firebaseService } from './FirebaseService';

class NotificationService {

  /**
   * Central Dispatcher Method
   * Database Event -> Supabase Realtime -> NotificationService -> UI Update -> FCM / PWA Push
   */
  async dispatchNotification(title, body, type, _settings = {}, loadNotificationsCallback = null) {
    console.log(`[NotificationService] Unified Dispatch '${type}':`, { title, body });

    // 1. Write to Supabase DB (Triggers Supabase Realtime live sync across devices)
    if (isSupabaseConfigured()) {
      try {
        const mappedType = (type === 'edit' || type === 'delete' || type === 'auth' || type === 'settings') ? 'system' : type;

        const { data, error } = await supabase
          .from('notifications')
          .insert([
            {
              title,
              body,
              type: mappedType,
              is_read: false
            }
          ])
          .select();

        console.log('[NotificationService] Supabase DB Insert Data:', data);
        if (error) console.error('[NotificationService] Supabase DB Insert Error:', error);

        if (loadNotificationsCallback) {
          await loadNotificationsCallback();
        }
      } catch (err) {
        console.error('[NotificationService] DB Insert Exception:', err);
      }
    }

    // 2. Dispatch to PWA Web Push (PushNotificationService)
    try {
      await pushNotificationService.sendLocalPush(title, body, type);
    } catch (err) {
      console.warn('[NotificationService] Web Push notice:', err);
    }

    // 3. Dispatch to Android Play Store FCM (FirebaseService)
    try {
      await firebaseService.sendPushNotification(title, body, type);
    } catch (err) {
      console.warn('[NotificationService] FCM notice:', err);
    }
  }

  /**
   * Automatic Monthly Financial Summary Notification
   */
  async generateMonthlySummaryNotification(totalIncome, totalExpense, currentBalance, settings = {}, loadNotificationsCallback = null) {
    const formattedIncome = Number(totalIncome).toLocaleString('en-IN');
    const formattedExpense = Number(totalExpense).toLocaleString('en-IN');
    const formattedBalance = Number(currentBalance).toLocaleString('en-IN');
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    const title = "📊 Monthly Financial Summary";
    const body = `Income: ₹${formattedIncome} | Expense: ₹${formattedExpense} | Savings: ₹${formattedBalance} (${savingsRate}% Savings Rate)`;

    await this.dispatchNotification(title, body, 'monthly_report', settings, loadNotificationsCallback);
  }
}

export const notificationService = new NotificationService();
