'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ShieldAlert, CheckCircle2, Copy, Check, RefreshCw, ChevronDown, ChevronUp, Database } from 'lucide-react';

export const SQL_FIX_SCRIPT = `-- =======================================================
-- JEEVRAKSHAK AI: 1-CLICK FIX TO ENABLE SUPABASE LIVE SYNC
-- Run this in your Supabase SQL Editor to allow live writes
-- to all 19 database tables with full multilingual support.
-- =======================================================

-- 1. Disable RLS for application data writes
ALTER TABLE administrative_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE herds DISABLE ROW LEVEL SECURITY;
ALTER TABLE animals DISABLE ROW LEVEL SECURITY;
ALTER TABLE disease_catalog DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_report_diseases DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_samples DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_escalations DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_vaccinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_advisories DISABLE ROW LEVEL SECURITY;
ALTER TABLE herd_health_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE outbreak_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 2. Add multilingual support columns (English, Hindi, Marathi)
ALTER TABLE administrative_locations ADD COLUMN IF NOT EXISTS name_en text, ADD COLUMN IF NOT EXISTS name_hi text, ADD COLUMN IF NOT EXISTS name_mr text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'mr';
ALTER TABLE herds ADD COLUMN IF NOT EXISTS name_en text, ADD COLUMN IF NOT EXISTS name_hi text, ADD COLUMN IF NOT EXISTS name_mr text;
ALTER TABLE disease_catalog ADD COLUMN IF NOT EXISTS name_en text, ADD COLUMN IF NOT EXISTS name_hi text, ADD COLUMN IF NOT EXISTS name_mr text, ADD COLUMN IF NOT EXISTS description_en text, ADD COLUMN IF NOT EXISTS description_hi text, ADD COLUMN IF NOT EXISTS description_mr text;
ALTER TABLE health_advisories ADD COLUMN IF NOT EXISTS title_en text, ADD COLUMN IF NOT EXISTS title_hi text, ADD COLUMN IF NOT EXISTS title_mr text, ADD COLUMN IF NOT EXISTS message_en text, ADD COLUMN IF NOT EXISTS message_hi text, ADD COLUMN IF NOT EXISTS message_mr text;
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS description_en text, ADD COLUMN IF NOT EXISTS description_hi text, ADD COLUMN IF NOT EXISTS description_mr text;
ALTER TABLE outbreak_events ADD COLUMN IF NOT EXISTS title_en text, ADD COLUMN IF NOT EXISTS title_hi text, ADD COLUMN IF NOT EXISTS title_mr text, ADD COLUMN IF NOT EXISTS description_en text, ADD COLUMN IF NOT EXISTS description_hi text, ADD COLUMN IF NOT EXISTS description_mr text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title_en text, ADD COLUMN IF NOT EXISTS title_hi text, ADD COLUMN IF NOT EXISTS title_mr text, ADD COLUMN IF NOT EXISTS message_en text, ADD COLUMN IF NOT EXISTS message_hi text, ADD COLUMN IF NOT EXISTS message_mr text;
`;

export const DatabaseStatusBanner: React.FC = () => {
  const { language } = useLanguage();
  const [status, setStatus] = useState<{
    loading: boolean;
    rlsBlocked: boolean;
    writePermitted: boolean;
    errorMsg?: string;
  }>({
    loading: true,
    rlsBlocked: false,
    writePermitted: false,
  });

  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/db');
      const data = await res.json();
      setStatus({
        loading: false,
        rlsBlocked: !!data.rlsBlocked,
        writePermitted: !!data.writePermitted,
        errorMsg: data.error?.message,
      });
    } catch {
      setStatus({
        loading: false,
        rlsBlocked: false,
        writePermitted: false,
        errorMsg: 'Could not reach database check endpoint',
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_FIX_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (dismissed) return null;

  // Case 1: Checking
  if (status.loading) {
    return (
      <div style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '6px 16px',
        fontSize: '0.78rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}>
        <RefreshCw size={13} className="animate-spin" />
        {language === 'mr'
          ? 'सुपाबेस १९-टेबल कनेक्टिव्हिटी तपासत आहे...'
          : language === 'hi'
          ? 'सुपाबेस 19-टेबल कनेक्टिविटी जांची जा रही है...'
          : 'Checking Supabase 19-table connectivity...'}
      </div>
    );
  }

  // Case 2: Connected & Write Permitted!
  if (status.writePermitted) {
    return (
      <div style={{
        background: '#ecfdf5',
        borderBottom: '1px solid #a7f3d0',
        padding: '8px 16px',
        fontSize: '0.78rem',
        color: '#065f46',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 600,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>
            {language === 'mr'
              ? 'सुपाबेस थेट समक्रमण सक्रिय: सर्व १९ डेटाबेस टेबल्स लेखनक्षम आणि समक्रमित आहेत!'
              : language === 'hi'
              ? 'सुपाबेस लाइव सिंक सक्रिय: सभी 19 डेटाबेस टेबल लिखने योग्य और सिंक्रनाइज़ हैं!'
              : 'Supabase Live Sync Active: All 19 database tables are writable and synchronized!'}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#065f46',
            cursor: 'pointer',
            fontSize: '0.75rem',
            textDecoration: 'underline',
          }}
        >
          {language === 'mr' ? 'बंद करा' : language === 'hi' ? 'हटाएं' : 'Dismiss'}
        </button>
      </div>
    );
  }

  // Case 3: RLS is blocking writes (The exact root cause of 0 rows in Supabase)
  if (status.rlsBlocked) {
    return (
      <div style={{
        background: '#fffbeb',
        borderBottom: '1px solid #fde68a',
        padding: '10px 16px',
        fontSize: '0.82rem',
        color: '#92400e',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 700 }}>
                {language === 'mr'
                  ? 'सुपाबेस जोडले गेले, परंतु पोस्टग्रेस आरएलएसद्वारे लेखन अवरोधित (त्रुटी ४२५०१)'
                  : language === 'hi'
                  ? 'सुपाबेस कनेक्टेड, लेकिन पोस्टग्रेएस आरएलएस द्वारा राइटिंग ब्लॉक (त्रुटि 42501)'
                  : 'Supabase Connected, but Writes Blocked by PostgreSQL RLS (Error 42501)'}
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#b45309' }}>
                {language === 'mr'
                  ? 'तुमचे १९ सुपाबेस टेबल्स रिकामे आहेत कारण पोस्टग्रेस आरएलएस डीफॉल्टनुसार क्लायंट लेखन नाकारते. सुपाबेस एसक्यूएल एडिटरमध्ये १५-सेकंदांचा उपाय चालवा.'
                  : language === 'hi'
                  ? 'आपकी 19 सुपाबेस टेबल खाली हैं क्योंकि पोस्टग्रेस आरएलएस डिफ़ॉल्ट रूप से क्लाइंट राइट्स को अस्वीकार करता है। सुपाबेस एसक्यूएल एडिटर में 15-सेकंड का फिक्स चलाएं।'
                  : 'Your 19 Supabase tables are empty because PostgreSQL Row-Level Security rejects client writes by default. Run the 15-second fix in Supabase SQL Editor.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                background: '#d97706',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied
                ? language === 'mr'
                  ? 'एसक्यूएल कॉपी झाले!'
                  : language === 'hi'
                  ? 'एसक्यूएल कॉपी हुआ!'
                  : 'SQL Copied!'
                : language === 'mr'
                ? '१-क्लिक एसक्यूएल फिक्स कॉपी करा'
                : language === 'hi'
                ? '1-क्लिक एसक्यूएल फिक्स कॉपी करें'
                : 'Copy 1-Click SQL Fix'}
            </button>

            <button
              onClick={checkStatus}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} />
              {language === 'mr' ? 'पुन्हा तपासा' : language === 'hi' ? 'पुनः जांचें' : 'Re-check'}
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#b45309',
                cursor: 'pointer',
                padding: '4px',
              }}
              title={
                expanded
                  ? language === 'mr'
                    ? 'एसक्यूएल स्क्रिप्ट लपवा'
                    : language === 'hi'
                    ? 'एसक्यूएल स्क्रिप्ट छुपाएं'
                    : 'Hide SQL script'
                  : language === 'mr'
                  ? 'एसक्यूएल स्क्रिप्ट पहा'
                  : language === 'hi'
                  ? 'एसक्यूएल स्क्रिप्ट देखें'
                  : 'View SQL script'
              }
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {expanded && (
          <div style={{ marginTop: '10px', background: '#1e293b', color: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, color: '#38bdf8' }}>
                {language === 'mr'
                  ? 'सुपाबेस डॅशबोर्ड > एसक्यूएल एडिटर मध्ये पेस्ट करा > रन करा:'
                  : language === 'hi'
                  ? 'सुपाबेस डैशबोर्ड > एसक्यूएल एडिटर में पेस्ट करें > रन करें:'
                  : 'Paste into Supabase Dashboard > SQL Editor > Run:'}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: '#334155',
                  border: 'none',
                  color: '#fff',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                }}
              >
                {copied
                  ? language === 'mr'
                    ? 'कॉपी झाले'
                    : language === 'hi'
                    ? 'कॉपी हुआ'
                    : 'Copied'
                  : language === 'mr'
                  ? 'कॉपी करा'
                  : language === 'hi'
                  ? 'कॉपी करें'
                  : 'Copy'}
              </button>
            </div>
            <pre style={{ margin: 0, overflowX: 'auto', fontFamily: 'monospace', lineHeight: 1.4, maxHeight: '180px' }}>
              {SQL_FIX_SCRIPT}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return null;
};
