'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Send,
  Eye,
  Smartphone,
  Mail,
  CheckCircle2,
  Calendar,
  Shield,
  MapPin,
  Activity,
  Users,
} from 'lucide-react';
import { AlertRiskLevel, TargetAudience, NotificationChannel } from '@/types/notificationSystem';
import { renderNotificationMessage } from '@/lib/notifications/notificationTemplates';

interface AdminDiseaseAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated: () => void;
}

export const AdminDiseaseAlertModal: React.FC<AdminDiseaseAlertModalProps> = ({
  isOpen,
  onClose,
  onAlertCreated,
}) => {
  const [diseaseName, setDiseaseName] = useState('Foot and Mouth Disease (FMD)');
  const [diseaseId, setDiseaseId] = useState('dis-1');
  const [regionLevel, setRegionLevel] = useState<'district' | 'block' | 'village'>('block');
  const [district, setDistrict] = useState('Pune');
  const [block, setBlock] = useState('Shirur');
  const [village, setVillage] = useState('Shirapur');
  const [riskLevel, setRiskLevel] = useState<AlertRiskLevel>('high');
  const [caseCount, setCaseCount] = useState('4');
  const [expiryDays, setExpiryDays] = useState('14');
  const [recommendedAction, setRecommendedAction] = useState(
    'Isolate affected cattle, administer supportive anti-inflammatory therapy, establish 5km buffer ring vaccination, and apply 4% sodium carbonate footbaths at farm gates.'
  );
  const [alertSummary, setAlertSummary] = useState(
    'Verified cases of Foot & Mouth Disease confirmed by taluka veterinary surveillance. Heightened vigilance instructed across sector.'
  );
  const [sourceAuthority, setSourceAuthority] = useState(
    'Department of Animal Husbandry, Govt of Maharashtra'
  );
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('both');
  const [smsChannel, setSmsChannel] = useState(true);
  const [emailChannel, setEmailChannel] = useState(true);

  // Preview tab: 'composer' | 'preview_sms' | 'preview_email'
  const [activeTab, setActiveTab] = useState<'composer' | 'preview_sms' | 'preview_email'>('composer');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const fullRegionName = [village, block, district].filter(Boolean).join(', ');

  const previewRender = renderNotificationMessage(
    riskLevel === 'critical' ? 'CRITICAL_ALERT' : riskLevel === 'high' ? 'HIGH_RISK_ALERT' : 'DISEASE_ALERT',
    {
      disease_name: diseaseName,
      region: fullRegionName,
      risk_level: riskLevel.toUpperCase(),
      case_count: caseCount,
      alert_summary: alertSummary,
      recommended_action: recommendedAction,
      source_authority: sourceAuthority,
      user_name: 'Livestock Owner / Dr. Veterinarian',
      farmer_name: 'Shri Suresh Shinde',
      vet_name: 'Dr. Priya Kulkarni',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const channels: NotificationChannel[] = [];
    if (smsChannel) channels.push('sms');
    if (emailChannel) channels.push('email');

    if (channels.length === 0) {
      setErrorMsg('Please select at least one delivery channel (SMS or Email).');
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const expiry = new Date(now.getTime() + parseInt(expiryDays, 10) * 86400000);

      const res = await fetch('/api/disease-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease_id: diseaseId,
          disease_name: diseaseName,
          region_level: regionLevel,
          district,
          block: block || undefined,
          village: village || undefined,
          risk_level: riskLevel,
          case_count: parseInt(caseCount, 10) || 0,
          reported_date: now.toISOString(),
          alert_start_date: now.toISOString(),
          alert_expiry_date: expiry.toISOString(),
          recommended_action: recommendedAction,
          source_authority: sourceAuthority,
          target_audience: targetAudience,
          sendNotifications: true,
          channels,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMsg(`Disease alert published! Dispatched notifications to ${json.notificationsDispatched || 0} registered stakeholders in ${district}.`);
        setTimeout(() => {
          onAlertCreated();
          onClose();
        }, 1600);
      } else {
        setErrorMsg(json.error || 'Failed to dispatch alert');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with alert engine');
    } finally {
      setLoading(false);
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
          maxWidth: '740px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(82, 183, 136, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} color="#FBBF24" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800 }}>
                Declare Regional Disease Alert & Dispatch SMS/Email
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#D8F3DC' }}>
                Government Disease Containment & Automated Stakeholder Dispatch Engine
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* View Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            padding: '4px 16px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('composer')}
            style={{
              padding: '10px 16px',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'composer' ? 800 : 600,
              color: activeTab === 'composer' ? '#2D6A4F' : '#64748B',
              borderBottom: activeTab === 'composer' ? '2px solid #2D6A4F' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            1. Alert Composer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview_sms')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'preview_sms' ? 800 : 600,
              color: activeTab === 'preview_sms' ? '#2D6A4F' : '#64748B',
              borderBottom: activeTab === 'preview_sms' ? '2px solid #2D6A4F' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Smartphone size={15} />
            <span>2. Preview SMS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview_email')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'preview_email' ? 800 : 600,
              color: activeTab === 'preview_email' ? '#2D6A4F' : '#64748B',
              borderBottom: activeTab === 'preview_email' ? '2px solid #2D6A4F' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Mail size={15} />
            <span>3. Preview Email</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: '#DCFCE7',
                color: '#166534',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 700,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: COMPOSER FORM */}
          {activeTab === 'composer' && (
            <form id="disease-alert-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Disease Name & Catalog ID
                  </label>
                  <select
                    value={diseaseName}
                    onChange={(e) => {
                      setDiseaseName(e.target.value);
                      if (e.target.value.includes('Foot')) setDiseaseId('dis-1');
                      else if (e.target.value.includes('Lumpy')) setDiseaseId('dis-2');
                      else if (e.target.value.includes('Anthrax')) setDiseaseId('dis-3');
                      else if (e.target.value.includes('Brucellosis')) setDiseaseId('dis-4');
                      else setDiseaseId('dis-gen');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                    }}
                  >
                    <option value="Foot and Mouth Disease (FMD)">Foot and Mouth Disease (FMD)</option>
                    <option value="Lumpy Skin Disease (LSD)">Lumpy Skin Disease (LSD)</option>
                    <option value="Anthrax (Bacillus anthracis)">Anthrax (Bacillus anthracis)</option>
                    <option value="Brucellosis">Brucellosis (Bovine)</option>
                    <option value="Haemorrhagic Septicaemia (HS)">Haemorrhagic Septicaemia (HS)</option>
                    <option value="Black Quarter (BQ)">Black Quarter (BQ)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Risk Level Classification
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {(['low', 'moderate', 'high', 'critical'] as AlertRiskLevel[]).map((lvl) => {
                      const isSelected = riskLevel === lvl;
                      const colors: Record<AlertRiskLevel, string> = {
                        low: '#10B981',
                        moderate: '#F59E0B',
                        high: '#F97316',
                        critical: '#EF4444',
                      };
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setRiskLevel(lvl)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '10px',
                            border: `1.5px solid ${isSelected ? colors[lvl] : '#E2E8F0'}`,
                            background: isSelected ? colors[lvl] : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#475569',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                          }}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Geographic Region Selector */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#2D6A4F" />
                  <span>Target Geographic Region (District → Taluka → Village)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                      placeholder="e.g. Pune"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Taluka / Block</label>
                    <input
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                      placeholder="e.g. Shirur"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Village (Optional)</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                      placeholder="e.g. Shirapur"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Active Cases</label>
                    <input
                      type="number"
                      value={caseCount}
                      onChange={(e) => setCaseCount(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                      placeholder="4"
                    />
                  </div>
                </div>
              </div>

              {/* Alert Summary & Recommended Action */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Verified Disease Alert Summary
                </label>
                <textarea
                  rows={2}
                  value={alertSummary}
                  onChange={(e) => setAlertSummary(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.82rem', resize: 'vertical' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Recommended Action (Official Veterinary Directive)
                </label>
                <textarea
                  rows={2}
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.82rem', resize: 'vertical' }}
                  required
                />
              </div>

              {/* Target Stakeholders & Channels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Target Stakeholders
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  >
                    <option value="both">Both Farmers & Area Veterinarians</option>
                    <option value="farmers">Farmers Only</option>
                    <option value="vets">Veterinarians Only</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Dispatch Channels
                  </label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '42px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={smsChannel} onChange={(e) => setSmsChannel(e.target.checked)} />
                      <span>SMS Gateway</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={emailChannel} onChange={(e) => setEmailChannel(e.target.checked)} />
                      <span>Email Delivery</span>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: LIVE SMS PREVIEW */}
          {activeTab === 'preview_sms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '380px',
                  background: '#F1F5F9',
                  borderRadius: '24px',
                  padding: '16px',
                  border: '8px solid #334155',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
              >
                <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748B', marginBottom: '12px', fontWeight: 600 }}>
                  Incoming Message • JeevRakshak AI Gateway
                </div>
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '14px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                    color: '#0F172A',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {previewRender.smsContent}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.68rem', color: '#94A3B8', marginTop: '6px' }}>
                  {previewRender.smsContent.length} chars • 1 SMS Segment
                </div>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748B', textAlign: 'center', maxWidth: '440px' }}>
                This message will be dispatched directly to mobile numbers registered in <strong>{fullRegionName}</strong>.
              </p>
            </div>
          )}

          {/* TAB 3: LIVE EMAIL PREVIEW */}
          {activeTab === 'preview_email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                <div><strong>Subject:</strong> {previewRender.subject}</div>
                <div style={{ marginTop: '4px' }}><strong>From:</strong> JeevRakshak AI &lt;alerts@jeevrakshak.org&gt;</div>
              </div>
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#FFFFFF',
                  padding: '16px',
                }}
                dangerouslySetInnerHTML={{ __html: previewRender.emailHtml }}
              />
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F8FAFC',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'transparent',
              border: '1px solid #CBD5E1',
              color: '#475569',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'composer' ? (
              <button
                type="button"
                onClick={() => setActiveTab('preview_sms')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#1E293B',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Eye size={15} />
                <span>Preview Messages</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('composer')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#1E293B',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Edit Details
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                background: '#2D6A4F',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(45, 106, 79, 0.25)',
              }}
            >
              <Send size={15} />
              <span>{loading ? 'Dispatching...' : 'Declare & Dispatch Alert'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
