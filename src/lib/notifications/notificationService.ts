// JeevRakshak AI - Notification Dispatcher & Idempotency Service
// Connects triggers, preferences, template rendering, delivery providers, and audit logging
// Channels: Telegram Bot & Email (SMS as optional fallback)

import {
  NotificationType,
  NotificationChannel,
  DeliveryStatus,
  NotificationHistoryRecord,
  NotificationPreferences,
  DispatchNotificationParams,
} from '@/types/notificationSystem';
import { renderNotificationMessage } from './notificationTemplates';
import { getTelegramProvider, getEmailProvider, getSmsProvider } from './mockProviders';
import { notificationStore } from './notificationStore';

// In-memory set of sent deduplication keys to prevent spam in current process
const sentDeduplicationKeys = new Set<string>();

export const notificationService = {
  /**
   * Generates a unique deduplication key to guarantee strict idempotency.
   */
  getDeduplicationKey(userId: string, type: NotificationType, channel: NotificationChannel, relatedEventId?: string): string {
    return `${userId}:${type}:${channel}:${relatedEventId || 'generic'}`;
  },

  /**
   * Retrieves or builds default notification preferences for a user.
   */
  getPreferences(userId: string): NotificationPreferences {
    return notificationStore.getPreferences(userId);
  },

  /**
   * Updates notification preferences for a user.
   */
  async updatePreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return await notificationStore.updatePreferences(userId, updates);
  },

  /**
   * Checks whether a notification type is allowed by user's preferences.
   */
  isNotificationAllowed(prefs: NotificationPreferences, type: NotificationType, channel: NotificationChannel, isCriticalOverride?: boolean): boolean {
    // Critical and high-risk alerts override standard suppression for emergency biosafety
    if (isCriticalOverride || type === 'CRITICAL_ALERT' || type === 'HIGH_RISK_ALERT') {
      return true;
    }

    if (channel === 'telegram' && !prefs.telegram_enabled) return false;
    if (channel === 'email' && !prefs.email_enabled) return false;
    if (channel === 'sms' && !prefs.sms_enabled) return false;

    switch (type) {
      case 'VACCINATION_UPCOMING':
      case 'VACCINATION_DUE':
      case 'VACCINATION_OVERDUE':
        return prefs.vaccination_reminders;
      case 'DISEASE_ALERT':
        return prefs.disease_alerts;
      case 'SEASONAL_ALERT':
        return prefs.regional_risk_alerts;
      case 'VACCINATION_CAMPAIGN':
        return prefs.vaccination_campaigns;
      case 'IMPORTANT_ANNOUNCEMENT':
        return prefs.health_announcements;
      case 'ACCOUNT_CREATED':
      case 'FIRST_LOGIN':
      case 'TELEGRAM_CONNECTED':
      case 'VET_INTERVENTION_ALERT':
        return true; // System & operational alerts are always deliverable
      default:
        return true;
    }
  },

  /**
   * Primary method to dispatch a notification via Telegram and/or Email.
   * Enforces strict idempotency, preference filtering, and audit logging.
   */
  async dispatch(params: DispatchNotificationParams): Promise<{
    telegramResult?: { sent: boolean; reason?: string };
    emailResult?: { sent: boolean; reason?: string };
    smsResult?: { sent: boolean; reason?: string };
  }> {
    const {
      type,
      userId,
      userName,
      userPhone,
      userEmail,
      userTelegramChatId,
      userRole,
      region,
      variables,
      preferredChannels,
      relatedEventId,
      diseaseId,
      diseaseName,
      isCriticalOverride,
    } = params;

    // In browser client: route dispatch through server API so real Telegram/Email providers run on backend
    if (typeof window !== 'undefined') {
      try {
        const apiRes = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const data = await apiRes.json();
        if (data && data.result) {
          return data.result;
        }
      } catch (err) {
        console.warn('[Client Dispatcher Network Fallback]:', err);
      }
    }

    const prefs = this.getPreferences(userId);
    const targetChannels: NotificationChannel[] = preferredChannels || ['telegram', 'email'];

    // Render message content with variables
    const rendered = renderNotificationMessage(type, {
      ...variables,
      user_name: userName,
      farmer_name: userName,
      vet_name: userName,
      user_role: userRole === 'farmer' ? 'Farmer' : userRole === 'veterinarian' ? 'Veterinarian' : 'Government Official',
      region: region || variables.region || 'Maharashtra',
    });

    const results: {
      telegramResult?: { sent: boolean; reason?: string };
      emailResult?: { sent: boolean; reason?: string };
      smsResult?: { sent: boolean; reason?: string };
    } = {};

    // 1. Process Telegram Channel
    if (targetChannels.includes('telegram')) {
      const dedupKey = this.getDeduplicationKey(userId, type, 'telegram', relatedEventId);

      if (sentDeduplicationKeys.has(dedupKey)) {
        results.telegramResult = { sent: false, reason: 'Duplicate prevented by idempotency engine' };
      } else {
        // Resolve Telegram Chat ID
        let chatId = userTelegramChatId;
        if (!chatId) {
          const conn = await notificationStore.getTelegramConnection(userId);
          if (conn && conn.status === 'connected') {
            chatId = conn.telegram_chat_id;
          }
        }

        if (!chatId) {
          results.telegramResult = { sent: false, reason: 'Telegram account not connected' };
        } else if (!this.isNotificationAllowed(prefs, type, 'telegram', isCriticalOverride)) {
          results.telegramResult = { sent: false, reason: 'Suppressed by user notification preferences' };
        } else {
          const telegramProvider = getTelegramProvider();
          const sendRes = await telegramProvider.sendMessage(chatId, rendered.telegramContent, 'HTML');

          if (sendRes.success) {
            sentDeduplicationKeys.add(dedupKey);
          }

          const status: DeliveryStatus = sendRes.success ? 'SENT' : 'FAILED';
          await notificationStore.recordHistory({
            user_id: userId,
            user_name: userName,
            user_phone: userPhone,
            user_email: userEmail,
            user_type: userRole,
            notification_type: type,
            channel: 'telegram',
            disease_id: diseaseId,
            disease_name: diseaseName,
            region,
            subject: rendered.subject,
            message: rendered.telegramContent,
            delivery_status: status,
            failure_reason: sendRes.error,
            related_event_id: relatedEventId,
            created_at: new Date().toISOString(),
            sent_at: sendRes.success ? new Date().toISOString() : undefined,
          });

          results.telegramResult = { sent: sendRes.success, reason: sendRes.error };
        }
      }
    }

    // 2. Process Email Channel
    if (targetChannels.includes('email')) {
      const dedupKey = this.getDeduplicationKey(userId, type, 'email', relatedEventId);

      if (sentDeduplicationKeys.has(dedupKey)) {
        results.emailResult = { sent: false, reason: 'Duplicate prevented by idempotency engine' };
      } else if (!userEmail) {
        results.emailResult = { sent: false, reason: 'No email address registered' };
      } else if (!this.isNotificationAllowed(prefs, type, 'email', isCriticalOverride)) {
        results.emailResult = { sent: false, reason: 'Suppressed by user notification preferences' };
      } else {
        const emailProvider = getEmailProvider();
        const sendRes = await emailProvider.sendEmail(
          userEmail,
          rendered.subject || 'JeevRakshak AI Notification',
          rendered.emailHtml,
          rendered.emailText
        );

        if (sendRes.success) {
          sentDeduplicationKeys.add(dedupKey);
        }

        const status: DeliveryStatus = sendRes.success ? 'SENT' : 'FAILED';
        await notificationStore.recordHistory({
          user_id: userId,
          user_name: userName,
          user_phone: userPhone,
          user_email: userEmail,
          user_type: userRole,
          notification_type: type,
          channel: 'email',
          disease_id: diseaseId,
          disease_name: diseaseName,
          region,
          subject: rendered.subject,
          message: rendered.emailText,
          delivery_status: status,
          failure_reason: sendRes.error,
          related_event_id: relatedEventId,
          created_at: new Date().toISOString(),
          sent_at: sendRes.success ? new Date().toISOString() : undefined,
        });

        results.emailResult = { sent: sendRes.success, reason: sendRes.error };
      }
    }

    // 3. Process SMS Channel (Legacy fallback if requested)
    if (targetChannels.includes('sms')) {
      const dedupKey = this.getDeduplicationKey(userId, type, 'sms', relatedEventId);

      if (sentDeduplicationKeys.has(dedupKey)) {
        results.smsResult = { sent: false, reason: 'Duplicate prevented by idempotency engine' };
      } else if (!userPhone) {
        results.smsResult = { sent: false, reason: 'No valid phone number on profile' };
      } else if (!this.isNotificationAllowed(prefs, type, 'sms', isCriticalOverride)) {
        results.smsResult = { sent: false, reason: 'Suppressed by user notification preferences' };
      } else {
        const smsProvider = getSmsProvider();
        const sendRes = await smsProvider.sendSms(userPhone, rendered.smsContent);

        if (sendRes.success) {
          sentDeduplicationKeys.add(dedupKey);
        }

        const status: DeliveryStatus = sendRes.success ? 'SENT' : 'FAILED';
        await notificationStore.recordHistory({
          user_id: userId,
          user_name: userName,
          user_phone: userPhone,
          user_email: userEmail,
          user_type: userRole,
          notification_type: type,
          channel: 'sms',
          disease_id: diseaseId,
          disease_name: diseaseName,
          region,
          subject: rendered.subject,
          message: rendered.smsContent,
          delivery_status: status,
          failure_reason: sendRes.error,
          related_event_id: relatedEventId,
          created_at: new Date().toISOString(),
          sent_at: sendRes.success ? new Date().toISOString() : undefined,
        });

        results.smsResult = { sent: sendRes.success, reason: sendRes.error };
      }
    }

    return results;
  },

  /**
   * Internal helper to record an audit log.
   */
  async recordHistory(record: Omit<NotificationHistoryRecord, 'id'>): Promise<NotificationHistoryRecord> {
    return await notificationStore.recordHistory(record);
  },

  /**
   * Fetches history logs with optional filtering.
   */
  getHistory(filters?: { userId?: string; channel?: NotificationChannel; type?: NotificationType }): NotificationHistoryRecord[] {
    return notificationStore.getHistory(filters);
  },
};
