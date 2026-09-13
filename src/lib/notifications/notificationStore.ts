// JeevRakshak AI - Unified Server/Client Notification & Telegram Store
// Provides reliable persistence for Telegram connections, linking tokens, preferences, and notification history.
// Uses filesystem persistence in Node.js runtime (.data/ folder) with Supabase synchronization.
// Safe for both Next.js Client Components and Server Route Handlers.

import {
  TelegramConnection,
  TelegramLinkingToken,
  NotificationPreferences,
  NotificationHistoryRecord,
} from '@/types/notificationSystem';
import { supabase } from '@/lib/supabase/client';

// Safely obtain Node.js modules without triggering client-side bundler resolution errors
function getNodeFs(): any {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line no-eval
      return eval('require')('fs');
    } catch {
      return null;
    }
  }
  return null;
}

function getNodePath(): any {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line no-eval
      return eval('require')('path');
    } catch {
      return null;
    }
  }
  return null;
}

interface StoreData {
  telegramConnections: TelegramConnection[];
  telegramLinkingTokens: TelegramLinkingToken[];
  preferences: NotificationPreferences[];
  history: NotificationHistoryRecord[];
}

class NotificationStore {
  private data: StoreData = {
    telegramConnections: [],
    telegramLinkingTokens: [],
    preferences: [],
    history: [],
  };
  private dataDir: string = '';
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    if (typeof window === 'undefined') {
      const fs = getNodeFs();
      const path = getNodePath();

      if (fs && path) {
        try {
          this.dataDir = path.join(process.cwd(), '.data');
          if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
          }
          const filePath = path.join(this.dataDir, 'notifications_store.json');
          if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            this.data = {
              telegramConnections: parsed.telegramConnections || [],
              telegramLinkingTokens: parsed.telegramLinkingTokens || [],
              preferences: parsed.preferences || [],
              history: parsed.history || [],
            };
          }
        } catch (err) {
          console.warn('[NotificationStore Init Warning]:', err);
        }
      }
    } else {
      try {
        const saved = localStorage.getItem('jr_notification_store');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.data = {
            telegramConnections: parsed.telegramConnections || [],
            telegramLinkingTokens: parsed.telegramLinkingTokens || [],
            preferences: parsed.preferences || [],
            history: parsed.history || [],
          };
        }
      } catch {
        // ignore
      }
    }
    this.initialized = true;
  }

  private persist() {
    if (typeof window === 'undefined') {
      const fs = getNodeFs();
      const path = getNodePath();

      if (fs && path) {
        try {
          if (!this.dataDir) {
            this.dataDir = path.join(process.cwd(), '.data');
          }
          if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
          }
          const filePath = path.join(this.dataDir, 'notifications_store.json');
          fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2), 'utf-8');
        } catch (err) {
          console.warn('[NotificationStore File Persist Error]:', err);
        }
      }
    } else {
      try {
        localStorage.setItem('jr_notification_store', JSON.stringify(this.data));
      } catch {
        // ignore
      }
    }
  }

  // --- Telegram Connections ---

  async getTelegramConnection(userId: string): Promise<TelegramConnection | null> {
    this.init();

    // Check memory / file store
    const local = this.data.telegramConnections.find(
      (c) => c.user_id === userId && c.status === 'connected'
    );
    if (local) return local;

    // Check remote Supabase if available
    try {
      const { data, error } = await supabase
        .from('telegram_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'connected')
        .maybeSingle();
      if (!error && data) {
        const conn = data as TelegramConnection;
        this.saveTelegramConnectionMemory(conn);
        return conn;
      }
    } catch {
      // Supabase table may not exist
    }

    return null;
  }

  async getTelegramConnectionByChatId(chatId: string): Promise<TelegramConnection | null> {
    this.init();

    const local = this.data.telegramConnections.find(
      (c) => c.telegram_chat_id === String(chatId) && c.status === 'connected'
    );
    if (local) return local;

    try {
      const { data, error } = await supabase
        .from('telegram_connections')
        .select('*')
        .eq('telegram_chat_id', String(chatId))
        .eq('status', 'connected')
        .maybeSingle();
      if (!error && data) {
        const conn = data as TelegramConnection;
        this.saveTelegramConnectionMemory(conn);
        return conn;
      }
    } catch {
      // ignore
    }

    return null;
  }

  private saveTelegramConnectionMemory(conn: TelegramConnection) {
    const idx = this.data.telegramConnections.findIndex((c) => c.id === conn.id);
    if (idx >= 0) {
      this.data.telegramConnections[idx] = conn;
    } else {
      this.data.telegramConnections.unshift(conn);
    }
    this.persist();
  }

  async saveTelegramConnection(conn: TelegramConnection): Promise<void> {
    this.init();
    this.saveTelegramConnectionMemory(conn);

    try {
      await supabase.from('telegram_connections').upsert(conn);
    } catch {
      // ignore
    }
  }

  async disconnectTelegram(userId: string): Promise<boolean> {
    this.init();
    const now = new Date().toISOString();
    let disconnected = false;

    for (const c of this.data.telegramConnections) {
      if (c.user_id === userId && c.status === 'connected') {
        c.status = 'disconnected';
        c.disconnected_at = now;
        c.updated_at = now;
        disconnected = true;
      }
    }
    this.persist();

    try {
      await supabase
        .from('telegram_connections')
        .update({ status: 'disconnected', disconnected_at: now, updated_at: now })
        .eq('user_id', userId);
    } catch {
      // ignore
    }

    return disconnected;
  }

  // --- Telegram Linking Tokens ---

  async createTelegramLinkingToken(userId: string): Promise<string> {
    this.init();
    const token = `link_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const record: TelegramLinkingToken = {
      token,
      user_id: userId,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      used: false,
    };

    this.data.telegramLinkingTokens.unshift(record);
    this.persist();

    try {
      await supabase.from('telegram_linking_tokens').insert([record]);
    } catch {
      // ignore
    }

    return token;
  }

  async verifyTelegramLinkingToken(
    token: string,
    chatId: string,
    username?: string,
    firstName?: string
  ): Promise<{ success: boolean; connection?: TelegramConnection; error?: string }> {
    this.init();
    const record = this.data.telegramLinkingTokens.find((t) => t.token === token && !t.used);
    if (!record) {
      return { success: false, error: 'Invalid or expired linking token' };
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      return { success: false, error: 'Linking token has expired' };
    }

    record.used = true;
    const now = new Date().toISOString();

    // Invalidate previous connections for this user or chatId
    for (const c of this.data.telegramConnections) {
      if (c.user_id === record.user_id || c.telegram_chat_id === String(chatId)) {
        c.status = 'disconnected';
        c.disconnected_at = now;
        c.updated_at = now;
      }
    }

    const newConnection: TelegramConnection = {
      id: `tg_conn_${Date.now()}`,
      user_id: record.user_id,
      telegram_chat_id: String(chatId),
      telegram_username: username || undefined,
      first_name: firstName || undefined,
      status: 'connected',
      connected_at: now,
      created_at: now,
      updated_at: now,
    };

    this.data.telegramConnections.unshift(newConnection);
    this.persist();

    try {
      await supabase.from('telegram_linking_tokens').update({ used: true }).eq('token', token);
      await supabase.from('telegram_connections').upsert([newConnection]);
    } catch {
      // ignore
    }

    return { success: true, connection: newConnection };
  }

  // --- Notification Preferences ---

  getPreferences(userId: string): NotificationPreferences {
    this.init();
    const found = this.data.preferences.find((p) => p.user_id === userId);
    if (found) return found;

    const defaultPrefs: NotificationPreferences = {
      user_id: userId,
      telegram_enabled: true,
      email_enabled: true,
      sms_enabled: false,
      vaccination_reminders: true,
      disease_alerts: true,
      regional_risk_alerts: true,
      vaccination_campaigns: true,
      health_announcements: true,
      updated_at: new Date().toISOString(),
    };
    this.data.preferences.push(defaultPrefs);
    this.persist();
    return defaultPrefs;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    this.init();
    const current = this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...updates,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    const idx = this.data.preferences.findIndex((p) => p.user_id === userId);
    if (idx >= 0) {
      this.data.preferences[idx] = updated;
    } else {
      this.data.preferences.push(updated);
    }
    this.persist();

    try {
      await supabase.from('notification_preferences').upsert([updated]);
    } catch {
      // ignore
    }

    return updated;
  }

  // --- Notification History & Audit ---

  async recordHistory(record: Omit<NotificationHistoryRecord, 'id'>): Promise<NotificationHistoryRecord> {
    this.init();
    const newRecord: NotificationHistoryRecord = {
      ...record,
      id: `notif_hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    this.data.history.unshift(newRecord);
    if (this.data.history.length > 500) {
      this.data.history = this.data.history.slice(0, 500);
    }
    this.persist();

    // Also mirror to existing Supabase notifications table if possible
    try {
      await supabase.from('notifications').insert([{
        recipient_profile_id: newRecord.user_id,
        title: newRecord.subject || `${newRecord.notification_type} Alert`,
        message: newRecord.message,
        notification_type: newRecord.notification_type,
        is_read: false,
        created_at: newRecord.created_at,
      }]);
    } catch {
      // ignore
    }

    return newRecord;
  }

  getHistory(filters?: {
    userId?: string;
    channel?: string;
    type?: string;
  }): NotificationHistoryRecord[] {
    this.init();
    let list = [...this.data.history];
    if (filters?.userId) {
      list = list.filter((i) => i.user_id === filters.userId);
    }
    if (filters?.channel) {
      list = list.filter((i) => i.channel === filters.channel);
    }
    if (filters?.type) {
      list = list.filter((i) => i.notification_type === filters.type);
    }
    return list;
  }
}

export const notificationStore = new NotificationStore();
