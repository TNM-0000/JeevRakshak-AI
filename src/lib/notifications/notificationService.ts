// JeevRakshak AI - Notification Dispatcher & Idempotency Service
// Connects triggers, preferences, template rendering, delivery providers, and audit logging

import {
  NotificationType,
  NotificationChannel,
  DeliveryStatus,
  NotificationHistoryRecord,
  NotificationPreferences,
  DispatchNotificationParams,
} from '@/types/notificationSystem';
import { renderNotificationMessage } from './notificationTemplates';
import { getSmsProvider, getEmailProvider } from './mockProviders';
import { dbInsert, dbUpdate } from '@/lib/supabase/dataService';

// In-memory persistent cache for fast lookup & offline fallback
class NotificationAuditStore {
  history: NotificationHistoryRecord[] = [];
  preferences: Map<string, NotificationPreferences> = new Map();
  sentDeduplicationKeys: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem('jr_notification_history');
        if (savedHistory) {
          this.history = JSON.parse(savedHistory);
          for (const item of this.history) {
            if (item.related_event_id) {
              this.sentDeduplicationKeys.add(`${item.user_id}:${item.notification_type}:${item.channel}:${item.related_event_id}`);
            }
          }
        }
        const savedPrefs = localStorage.getItem('jr_notification_preferences');
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          if (Array.isArray(parsed)) {
            for (const p of parsed) {
              this.preferences.set(p.user_id, p);
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }

  save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jr_notification_history', JSON.stringify(this.history.slice(0, 500)));
        const prefArray = Array.from(this.preferences.values());
        localStorage.setItem('jr_notification_preferences', JSON.stringify(prefArray));
      } catch {
        // ignore
      }
    }
  }
}

export const auditStore = new NotificationAuditStore();

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
    const existing = auditStore.preferences.get(userId);
    if (existing) return existing;

    const defaultPrefs: NotificationPreferences = {
      user_id: userId,
      sms_enabled: true,
      email_enabled: true,
      vaccination_reminders: true,
      disease_alerts: true,
      regional_risk_alerts: true,
      vaccination_campaigns: true,
      health_announcements: true,
      updated_at: new Date().toISOString(),
    };
    auditStore.preferences.set(userId, defaultPrefs);
    auditStore.save();
    return defaultPrefs;
  },

  /**
   * Updates notification preferences for a user.
   */
  async updatePreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...updates,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    auditStore.preferences.set(userId, updated);
    auditStore.save();

    // Persist to Supabase table
    try {
      await dbInsert('notification_preferences', [updated]);
    } catch {
      // ignore
    }

    return updated;
  },

  /**
   * Checks whether a notification type is allowed by user's preferences.
   */
  isNotificationAllowed(prefs: NotificationPreferences, type: NotificationType, channel: NotificationChannel, isCriticalOverride?: boolean): boolean {
    // Critical and high-risk alerts override standard suppression for emergency biosafety
    if (isCriticalOverride || type === 'CRITICAL_ALERT' || type === 'HIGH_RISK_ALERT') {
      return true;
    }

    if (channel === 'sms' && !prefs.sms_enabled) return false;
    if (channel === 'email' && !prefs.email_enabled) return false;

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
      case 'VET_INTERVENTION_ALERT':
        return true; // System & operational alerts always deliverable
      default:
        return true;
    }
  },

  /**
   * Primary method to dispatch a notification via SMS and/or Email.
   * Enforces strict idempotency, preference filtering, and audit logging.
   */
  async dispatch(params: DispatchNotificationParams): Promise<{
    smsResult?: { sent: boolean; reason?: string };
    emailResult?: { sent: boolean; reason?: string };
  }> {
    const {
      type,
      userId,
      userName,
      userPhone,
      userEmail,
      userRole,
      region,
      variables,
      preferredChannels,
      relatedEventId,
      diseaseId,
      diseaseName,
      isCriticalOverride,
    } = params;

    // In browser client: route dispatch through server API so real SMS/Email providers run on backend
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
    const targetChannels: NotificationChannel[] = preferredChannels || ['sms', 'email'];

    // Render message content with variables
    const rendered = renderNotificationMessage(type, {
      ...variables,
      user_name: userName,
      farmer_name: userName,
      vet_name: userName,
      user_role: userRole === 'farmer' ? 'Farmer' : userRole === 'veterinarian' ? 'Veterinarian' : 'Government Official',
      region: region || variables.region || 'Pune District',
    });

    const results: {
      smsResult?: { sent: boolean; reason?: string };
      emailResult?: { sent: boolean; reason?: string };
    } = {};

    // 1. Process SMS Channel
    if (targetChannels.includes('sms')) {
      const dedupKey = this.getDeduplicationKey(userId, type, 'sms', relatedEventId);

      if (auditStore.sentDeduplicationKeys.has(dedupKey)) {
        results.smsResult = { sent: false, reason: 'Duplicate prevented by idempotency engine' };
      } else if (!userPhone) {
        results.smsResult = { sent: false, reason: 'No valid phone number on profile' };
        await this.recordHistory({
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
          delivery_status: 'FAILED',
          failure_reason: 'Missing recipient phone number',
          related_event_id: relatedEventId,
          created_at: new Date().toISOString(),
        });
      } else if (!this.isNotificationAllowed(prefs, type, 'sms', isCriticalOverride)) {
        results.smsResult = { sent: false, reason: 'Suppressed by user notification preferences' };
      } else {
        const smsProvider = getSmsProvider();
        const sendRes = await smsProvider.sendSms(userPhone, rendered.smsContent);

        auditStore.sentDeduplicationKeys.add(dedupKey);

        const status: DeliveryStatus = sendRes.success ? 'SENT' : 'FAILED';
        await this.recordHistory({
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
          sent_at: new Date().toISOString(),
        });

        results.smsResult = { sent: sendRes.success, reason: sendRes.error };
      }
    }

    // 2. Process Email Channel
    if (targetChannels.includes('email')) {
      const dedupKey = this.getDeduplicationKey(userId, type, 'email', relatedEventId);

      if (auditStore.sentDeduplicationKeys.has(dedupKey)) {
        results.emailResult = { sent: false, reason: 'Duplicate prevented by idempotency engine' };
      } else if (!userEmail) {
        // Many farmers may not have an email; skip gracefully without error
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

        auditStore.sentDeduplicationKeys.add(dedupKey);

        const status: DeliveryStatus = sendRes.success ? 'SENT' : 'FAILED';
        await this.recordHistory({
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
          sent_at: new Date().toISOString(),
        });

        results.emailResult = { sent: sendRes.success, reason: sendRes.error };
      }
    }

    return results;
  },

  /**
   * Internal helper to record an audit log in memory and Supabase.
   */
  async recordHistory(record: Omit<NotificationHistoryRecord, 'id'>): Promise<NotificationHistoryRecord> {
    const newRecord: NotificationHistoryRecord = {
      ...record,
      id: `notif_hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    auditStore.history.unshift(newRecord);
    auditStore.save();

    // Persist to Supabase notification_history table
    try {
      await dbInsert('notification_history', [{
        user_id: newRecord.user_id,
        user_name: newRecord.user_name,
        user_phone: newRecord.user_phone,
        user_email: newRecord.user_email,
        user_type: newRecord.user_type,
        notification_type: newRecord.notification_type,
        channel: newRecord.channel,
        disease_id: newRecord.disease_id,
        disease_name: newRecord.disease_name,
        region: newRecord.region,
        subject: newRecord.subject,
        message: newRecord.message,
        delivery_status: newRecord.delivery_status,
        failure_reason: newRecord.failure_reason,
        related_event_id: newRecord.related_event_id,
        created_at: newRecord.created_at,
        sent_at: newRecord.sent_at,
      }]);
    } catch {
      // ignore
    }

    return newRecord;
  },

  /**
   * Fetches history logs with optional filtering.
   */
  getHistory(filters?: { userId?: string; channel?: NotificationChannel; type?: NotificationType }): NotificationHistoryRecord[] {
    let items = [...auditStore.history];
    if (filters?.userId) {
      items = items.filter((i) => i.user_id === filters.userId);
    }
    if (filters?.channel) {
      items = items.filter((i) => i.channel === filters.channel);
    }
    if (filters?.type) {
      items = items.filter((i) => i.notification_type === filters.type);
    }
    return items;
  },
};
