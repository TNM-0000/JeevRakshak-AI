'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Bell,
  Mail,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Send,
  ExternalLink,
  Unlink,
  RefreshCw,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { NotificationPreferences, TelegramConnection } from '@/types/notificationSystem';
import { notificationService } from '@/lib/notifications/notificationService';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  userId,
  onClose,
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
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
  });

  const [saved, setSaved] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{
    connected: boolean;
    connection?: TelegramConnection;
  }>({ connected: false });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkData, setLinkData] = useState<{
    deepLink: string;
    token: string;
    botUsername: string;
  } | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingTestTelegram, setSendingTestTelegram] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'SUCCESS' | 'FAILED'; message: string } | null>(null);
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load preferences
  useEffect(() => {
    if (userId) {
      const current = notificationService.getPreferences(userId);
      setPrefs({
        ...current,
        telegram_enabled: current.telegram_enabled ?? true,
      });
    }
  }, [userId]);

  // Load Telegram Status
  const checkTelegramStatus = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingStatus(true);
      const res = await fetch(`/api/telegram/status?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setTelegramStatus({
          connected: Boolean(data.connected),
          connection: data.connection,
        });
      }
    } catch (err) {
      console.error('Failed to fetch Telegram connection status:', err);
    } finally {
      setLoadingStatus(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      checkTelegramStatus();
    }
  }, [isOpen, userId, checkTelegramStatus]);

  // Poll for connection when linkData is active
  useEffect(() => {
    if (!linkData || telegramStatus.connected) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/status?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.connected) {
            setTelegramStatus({
              connected: true,
              connection: data.connection,
            });
            setLinkData(null);
            clearInterval(interval);
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [linkData, telegramStatus.connected, userId]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    await notificationService.updatePreferences(userId, prefs);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  // Generate Telegram Deep Link
  const handleConnectTelegram = async () => {
    setGeneratingLink(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/telegram/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLinkData({
          deepLink: data.deepLink,
          token: data.token,
          botUsername: data.botUsername,
        });
        // Open Telegram in a new window/tab if not in simulation
        window.open(data.deepLink, '_blank', 'noopener,noreferrer');
      } else {
        setErrorMsg(data.error || 'Failed to generate linking deep-link.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error connecting to Telegram API.');
    } finally {
      setGeneratingLink(false);
    }
  };

  // Simulate Telegram Link Verification (for testing / demo environments without live webhooks)
  const handleSimulateBotVerification = async () => {
    if (!linkData?.token && !userId) return;
    setSimulating(true);
    setErrorMsg(null);
    try {
      let token = linkData?.token;
      if (!token) {
        // Generate a token first
        const tokenRes = await fetch('/api/telegram/link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const tokenData = await tokenRes.json();
        token = tokenData.token;
      }

      const res = await fetch('/api/telegram/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          chatId: `sim_${Math.floor(10000000 + Math.random() * 90000000)}`,
          username: 'kisan_sahayak_demo',
          firstName: 'Suresh',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await checkTelegramStatus();
        setLinkData(null);
        setTestSentMsg('Telegram Bot successfully connected! Welcome dispatch completed.');
        setTimeout(() => setTestSentMsg(null), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to simulate verification.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Simulation error.');
    } finally {
      setSimulating(false);
    }
  };

  // Disconnect Telegram Account
  const handleDisconnectTelegram = async () => {
    setDisconnecting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramStatus({ connected: false });
        setLinkData(null);
        setTestSentMsg('Telegram connection unlinked successfully.');
        setTimeout(() => setTestSentMsg(null), 3000);
      } else {
        setErrorMsg(data.error || 'Failed to disconnect Telegram.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error disconnecting.');
    } finally {
      setDisconnecting(false);
    }
  };

  // Dedicated Telegram Test Dispatch (Step 8)
  const handleSendTestTelegram = async () => {
    setSendingTestTelegram(true);
    setTestResult(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          status: 'SUCCESS',
          message: data.message || 'Telegram message sent successfully.',
        });
      } else {
        setTestResult({
          status: 'FAILED',
          message: data.error || 'Telegram API request failed.',
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'FAILED',
        message: err.message || 'Network error executing Telegram test.',
      });
    } finally {
      setSendingTestTelegram(false);
    }
  };

  // Dedicated Email Test Dispatch (Step 9)
  const handleSendTestEmail = async () => {
    setSendingTestEmail(true);
    setTestResult(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          status: 'SUCCESS',
          message: data.message || 'Email sent successfully.',
        });
      } else {
        setTestResult({
          status: 'FAILED',
          message: data.error || 'Email delivery failed.',
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'FAILED',
        message: err.message || 'Network error executing Email test.',
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '92vh',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          border: '1px solid #CBD5E1',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f766e 0%, #065f46 100%)',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                Notification & Telegram Settings
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#ccfbf1' }}>
                Manage Telegram Bot, Email alerts, and disease updates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {saved && (
            <div
              style={{
                background: '#DCFCE7',
                color: '#166534',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Preferences saved successfully!</span>
            </div>
          )}

          {testSentMsg && (
            <div
              style={{
                background: '#E0F2FE',
                color: '#0369A1',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{testSentMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: TELEGRAM BOT INTEGRATION CARD */}
          <div
            style={{
              background: telegramStatus.connected
                ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
                : 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
              border: `1.5px solid ${telegramStatus.connected ? '#86EFAC' : '#BAE6FD'}`,
              borderRadius: '18px',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#0088cc',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Send size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                    Telegram Notification Channel
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                    Instant alerts via official @JeevRakshakBot
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: telegramStatus.connected ? '#15803D' : '#64748B',
                  color: '#FFFFFF',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: telegramStatus.connected ? '#86EFAC' : '#CBD5E1',
                  }}
                />
                <span>{telegramStatus.connected ? 'Connected' : 'Not Connected'}</span>
              </div>
            </div>

            {telegramStatus.connected ? (
              // Connected details
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    border: '1px solid #BBF7D0',
                    fontSize: '0.78rem',
                    color: '#166534',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div>
                    <strong>Connected User:</strong>{' '}
                    {telegramStatus.connection?.telegram_username
                      ? `@${telegramStatus.connection.telegram_username}`
                      : telegramStatus.connection?.first_name || 'Verified Stakeholder'}
                  </div>
                  <div style={{ color: '#4B5563', fontSize: '0.72rem' }}>
                    <strong>Chat ID:</strong> {telegramStatus.connection?.telegram_chat_id || 'Active'} •{' '}
                    <strong>Linked:</strong>{' '}
                    {telegramStatus.connection?.created_at
                      ? new Date(telegramStatus.connection.created_at).toLocaleDateString()
                      : 'Active'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleSendTestTelegram}
                    disabled={sendingTestTelegram}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#0284C7',
                      color: '#FFFFFF',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Zap size={14} />
                    <span>{sendingTestTelegram ? 'Dispatching...' : 'Send Test Telegram'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnectTelegram}
                    disabled={disconnecting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid #FCA5A5',
                      background: '#FFFFFF',
                      color: '#DC2626',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Unlink size={13} />
                    <span>{disconnecting ? 'Unlinking...' : 'Disconnect'}</span>
                  </button>
                </div>
              </div>
            ) : (
              // Not connected prompt & buttons
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                  Link your Telegram account using a secure deep-link to receive critical animal health
                  alerts, disease outbreaks, and vaccination schedules directly in Telegram.
                </p>

                {linkData && (
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid #93C5FD',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: 700 }}>
                      Step 1: Open Bot in Telegram &amp; Press &quot;Start&quot;
                    </div>
                    <div
                      style={{
                        background: '#F8FAFC',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontFamily: 'monospace',
                        color: '#0F172A',
                        wordBreak: 'break-all',
                        border: '1px dashed #CBD5E1',
                      }}
                    >
                      {linkData.deepLink}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      Waiting for verification... (Valid for 15 minutes)
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleConnectTelegram}
                    disabled={generatingLink}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#0088cc',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0, 136, 204, 0.25)',
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>{generatingLink ? 'Opening Telegram...' : 'Connect Telegram'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateBotVerification}
                    disabled={simulating}
                    title="Simulate successful Telegram Bot link for offline/local demonstration without webhook"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #94A3B8',
                      background: '#FFFFFF',
                      color: '#475569',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={13} className={simulating ? 'animate-spin' : ''} />
                    <span>{simulating ? 'Simulating...' : 'Simulate Bot Link (Demo)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: DELIVERY CHANNELS TOGGLE */}
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#64748B',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Active Delivery Channels
            </div>
            <div className="responsive-grid-2" style={{ gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleToggle('telegram_enabled')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1.5px solid ${prefs.telegram_enabled ? '#0088cc' : '#CBD5E1'}`,
                  background: prefs.telegram_enabled ? '#F0F9FF' : '#F8FAFC',
                  cursor: 'pointer',
                  color: prefs.telegram_enabled ? '#0369A1' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                }}
              >
                <Send size={16} />
                <span>Telegram Bot Alerts</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggle('email_enabled')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1.5px solid ${prefs.email_enabled ? '#059669' : '#CBD5E1'}`,
                  background: prefs.email_enabled ? '#ECFDF5' : '#F8FAFC',
                  cursor: 'pointer',
                  color: prefs.email_enabled ? '#065F46' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                }}
              >
                <Mail size={16} />
                <span>Email Alerts</span>
              </button>
            </div>

            {/* Optional legacy SMS toggle */}
            <div style={{ marginTop: '8px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  color: '#64748B',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={14} />
                  <span>Legacy SMS Alerts (Fallback)</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(prefs.sms_enabled)}
                  onChange={() => handleToggle('sms_enabled')}
                />
              </label>
            </div>
          </div>

          {/* SECTION 3: NOTIFICATION TOPICS */}
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#64748B',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Subscribed Topics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { key: 'vaccination_reminders', label: 'Vaccination Reminders & Overdue countdowns' },
                { key: 'disease_alerts', label: 'Regional Disease Outbreak Alerts' },
                { key: 'regional_risk_alerts', label: 'Seasonal Health Advisories & Risk Updates' },
                { key: 'vaccination_campaigns', label: 'Government Vaccination Campaigns (NADCP)' },
                { key: 'health_announcements', label: 'Important Animal Husbandry Announcements' },
              ].map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    border: '1px solid #F1F5F9',
                  }}
                >
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean((prefs as any)[item.key])}
                    onChange={() => handleToggle(item.key as keyof NotificationPreferences)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Critical Biosecurity Disclaimer */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.74rem',
              color: '#1E40AF',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>
              Critical bio-containment alerts are automatically dispatched via Telegram &amp; Email for
              public safety even if standard advisory notifications are paused.
            </span>
          </div>

          {/* SECTION 4: DEVELOPMENT TESTING & LIVE DIAGNOSTICS (Step 8 & Step 9) */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={15} color="#F59E0B" />
                <span>Development &amp; Diagnostics Testing</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#64748B', background: '#E2E8F0', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                STEPS 8 &amp; 9
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
              Verify live API routing to your Telegram account and registered email address. Results reflect actual backend responses.
            </p>

            <div className="responsive-grid-2" style={{ gap: '8px' }}>
              <button
                type="button"
                onClick={handleSendTestTelegram}
                disabled={sendingTestTelegram}
                id="btn-test-telegram"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#0088cc',
                  color: '#FFFFFF',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: sendingTestTelegram ? 0.7 : 1,
                }}
              >
                <Send size={13} />
                <span>{sendingTestTelegram ? 'Testing Telegram...' : 'Send Test Telegram'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail}
                id="btn-test-email"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: sendingTestEmail ? 0.7 : 1,
                }}
              >
                <Mail size={13} />
                <span>{sendingTestEmail ? 'Testing Email...' : 'Send Test Email'}</span>
              </button>
            </div>

            {/* Live Backend Test Status Banner */}
            {testResult && (
              <div
                id="test-status-banner"
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: testResult.status === 'SUCCESS' ? '#DCFCE7' : '#FEE2E2',
                  border: testResult.status === 'SUCCESS' ? '1px solid #86EFAC' : '1px solid #FCA5A5',
                  color: testResult.status === 'SUCCESS' ? '#15803D' : '#B91C1C',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {testResult.status === 'SUCCESS' ? (
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                ) : (
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                )}
                <div>
                  <strong>{testResult.status}:</strong> {testResult.message}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: '#F8FAFC',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#059669',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
