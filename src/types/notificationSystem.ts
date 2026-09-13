// JeevRakshak AI - Regional Disease Alert & Telegram/Email Notification System Types
// Strictly mirrors requirements for SIH 2026

export type NotificationType =
  | 'ACCOUNT_CREATED'
  | 'FIRST_LOGIN'
  | 'TELEGRAM_CONNECTED'
  | 'VACCINATION_UPCOMING'
  | 'VACCINATION_DUE'
  | 'VACCINATION_OVERDUE'
  | 'DISEASE_ALERT'
  | 'HIGH_RISK_ALERT'
  | 'CRITICAL_ALERT'
  | 'SEASONAL_ALERT'
  | 'VACCINATION_CAMPAIGN'
  | 'VET_INTERVENTION_ALERT'
  | 'IMPORTANT_ANNOUNCEMENT';

export type AlertRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type AlertStatus = 'active' | 'resolved' | 'expired';

export type TargetAudience = 'farmers' | 'vets' | 'both';

export type NotificationChannel = 'telegram' | 'email' | 'sms';

export type DeliveryStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';

export interface TelegramConnection {
  id: string;
  user_id: string;
  telegram_chat_id: string;
  telegram_username?: string;
  first_name?: string;
  status: 'connected' | 'disconnected';
  connected_at: string;
  disconnected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TelegramLinkingToken {
  token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
  used: boolean;
}

export interface DiseaseAlert {
  id: string;
  disease_id: string;
  disease_name: string;
  region_level: 'state' | 'district' | 'block' | 'village';
  district: string;
  block?: string;
  taluka?: string;
  village?: string;
  risk_level: AlertRiskLevel;
  case_count: number;
  reported_date: string;
  alert_start_date: string;
  alert_expiry_date: string;
  recommended_action: string;
  description?: string;
  containment_radius_km?: number;
  species_targeted?: string[];
  preventive_measures?: string[];
  source_authority: string;
  status: AlertStatus;
  target_audience: TargetAudience;
  created_at: string;
  updated_at?: string;
}

export interface NotificationHistoryRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  user_type: 'farmer' | 'veterinarian' | 'government';
  notification_type: NotificationType;
  channel: NotificationChannel;
  disease_id?: string;
  disease_name?: string;
  region?: string;
  subject?: string;
  message: string;
  delivery_status: DeliveryStatus;
  failure_reason?: string;
  related_event_id?: string;
  created_at: string;
  sent_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  telegram_enabled: boolean;
  email_enabled: boolean;
  sms_enabled?: boolean;
  vaccination_reminders: boolean;
  disease_alerts: boolean;
  regional_risk_alerts: boolean;
  vaccination_campaigns: boolean;
  health_announcements: boolean;
  updated_at: string;
}

export interface NotificationTemplateVariables {
  farmer_name?: string;
  vet_name?: string;
  user_name?: string;
  user_role?: string;
  animal_name?: string;
  animal_tag?: string;
  animal_type?: string;
  vaccine_name?: string;
  due_date?: string;
  disease_name?: string;
  region?: string;
  risk_level?: string;
  case_count?: number | string;
  alert_summary?: string;
  recommended_action?: string;
  source_authority?: string;
  contact_information?: string;
  campaign_dates?: string;
  overdue_days?: number | string;
  overdue_count?: number | string;
  reports_requiring_review?: number | string;
}

export interface DispatchNotificationParams {
  type: NotificationType;
  userId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  userTelegramChatId?: string;
  userRole: 'farmer' | 'veterinarian' | 'government';
  region?: string;
  variables: NotificationTemplateVariables;
  preferredChannels?: NotificationChannel[];
  relatedEventId?: string;
  diseaseId?: string;
  diseaseName?: string;
  isCriticalOverride?: boolean; // Critical alerts cannot be turned off accidentally
}
