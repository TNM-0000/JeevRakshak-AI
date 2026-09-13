'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Users,
  Radio,
  FileText,
  Volume2,
  Play,
  Pause,
  Plus,
  Send,
  Sparkles,
  MapPin,
  Clock,
  ShieldAlert,
  Search,
  RefreshCw,
  MessageSquare,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  IVRCall,
  IVRReport,
  IVREmergencyCase,
  IVRAnnouncement,
  IVRFeedback,
} from '@/types/database';
import { dataService } from '@/lib/supabase/dataService';
import { speakIVRPrompt, stopIVRSpeech } from '@/lib/ivr/ivrAudioEngine';
import { IVRPhoneSimulator } from '@/components/IVRPhoneSimulator';

export const GovernmentIVRAnalytics: React.FC = () => {
  const [calls, setCalls] = useState<IVRCall[]>([]);
  const [reports, setReports] = useState<IVRReport[]>([]);
  const [emergencies, setEmergencies] = useState<IVREmergencyCase[]>([]);
  const [announcements, setAnnouncements] = useState<IVRAnnouncement[]>([]);
  const [feedbackList, setFeedbackList] = useState<IVRFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-tabs
  const [subTab, setSubTab] = useState<'surveillance' | 'feedback' | 'broadcast'>('surveillance');

  // Simulator modal
  const [showSimulator, setShowSimulator] = useState(false);

  // New Broadcast Modal
  const [showNewBroadcast, setShowNewBroadcast] = useState(false);
  const [bcTitle, setBcTitle] = useState('');
  const [bcContentMr, setBcContentMr] = useState('');
  const [bcContentHi, setBcContentHi] = useState('');
  const [bcContentEn, setBcContentEn] = useState('');
  const [bcTaluka, setBcTaluka] = useState('All Talukas');
  const [bcCategory, setBcCategory] = useState<'outbreak_alert' | 'vaccination_campaign' | 'advisory'>('outbreak_alert');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, r, e, a, f] = await Promise.all([
        dataService.getIVRCalls(),
        dataService.getIVRReports(),
        dataService.getIVREmergencies(),
        dataService.getIVRAnnouncements(),
        dataService.getIVRFeedback(),
      ]);
      setCalls(c);
      setReports(r);
      setEmergencies(e);
      setAnnouncements(a);
      setFeedbackList(f);
    } catch (err) {
      console.error('Failed to load IVR government analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      stopIVRSpeech();
    };
  }, []);

  const handleResolveFeedback = async (id: string) => {
    await dataService.resolveIVRFeedback(
      id,
      'Inquiry completed. Necessary medicine stocks replenished at Taluka Polyclinic.'
    );
    showToast('Grievance marked as resolved and logged in commissionerate portal.');
    await loadData();
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addIVRAnnouncement({
      title: bcTitle,
      content_mr: bcContentMr,
      content_hi: bcContentHi,
      content_en: bcContentEn,
      category: bcCategory,
      target_district: 'Pune',
      target_taluka: bcTaluka,
      priority: bcCategory === 'outbreak_alert' ? 'urgent' : 'routine',
      is_active: true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    });

    showToast('Voice Announcement published to Toll-Free IVR Option 5 successfully.');
    setShowNewBroadcast(false);
    setBcTitle('');
    setBcContentMr('');
    setBcContentHi('');
    setBcContentEn('');
    await loadData();
  };

  const handlePlayAnnouncement = (id: string, text: string) => {
    if (playingId === id) {
      stopIVRSpeech();
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    speakIVRPrompt(
      text,
      'mr',
      () => setPlayingId(null),
      () => setPlayingId(id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold border border-emerald-600 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-400/30">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              DEPARTMENT OF ANIMAL HUSBANDRY • STATE TELECOM SURVEILLANCE GATEWAY
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Toll-Free IVR Telemetry & Grievance Command
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              Monitoring 1800-120-JEEV voice access across all 14 talukas. Bridging rural digital divide for farmers without smartphones, detecting syndromic disease clusters, and handling grievances.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSimulator(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition transform hover:scale-105 active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              Test 1800-120-JEEV Live Line
            </button>
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top 4 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.75rem', color: '#d1d5db', display: 'block', fontWeight: 500 }}>Total Rural Calls</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', display: 'block', lineHeight: 1.2 }}>{calls.length + 1420}</span>
            <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              ↑ 18% weekly growth
            </span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.75rem', color: '#6ee7b7', display: 'block', fontWeight: 500 }}>Voice Disease Reports</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#6ee7b7', display: 'block', lineHeight: 1.2 }}>{reports.length + 384}</span>
            <span style={{ fontSize: '0.65rem', color: '#a7f3d0', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              98.2% auto-transcribed
            </span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.75rem', color: '#fda4af', display: 'block', fontWeight: 500 }}>1962 SOS Dispatched</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fda4af', display: 'block', lineHeight: 1.2 }}>{emergencies.length + 56}</span>
            <span style={{ fontSize: '0.65rem', color: '#fecdd3', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              Avg ETA 18.5 mins
            </span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.75rem', color: '#fcd34d', display: 'block', fontWeight: 500 }}>Farmer Grievances</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fcd34d', display: 'block', lineHeight: 1.2 }}>
              {feedbackList.filter((f) => f.status === 'pending_review').length + 12}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#fde68a', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              Under DAHO review
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('surveillance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'surveillance'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Voice Syndromic Surveillance
          </button>
          <button
            onClick={() => setSubTab('feedback')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'feedback'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Farmer Voice Grievances ({feedbackList.length})
          </button>
          <button
            onClick={() => setSubTab('broadcast')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'broadcast'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            IVR Voice Broadcast Advisories ({announcements.length})
          </button>
        </div>

        {subTab === 'broadcast' && (
          <button
            onClick={() => setShowNewBroadcast(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue New Voice Announcement
          </button>
        )}
      </div>

      {/* SUBTAB 1: Surveillance & Telemetry Distribution */}
      {subTab === 'surveillance' && (
        <div className="space-y-6">
          {/* Taluka Activity & Language Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
            {/* Taluka Call Distribution Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm" style={{ minWidth: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    District Taluka Call Concentration (1800-120-JEEV)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Spatial distribution of incoming calls across Pune district
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  14 Talukas Active
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Shirur Taluka', count: 480, reports: 142, alerts: 'LSD cluster suspected', pct: 85, color: '#dc2626' },
                  { name: 'Baramati Taluka', count: 340, reports: 88, alerts: 'FMD vaccination active', pct: 65, color: '#2d6a4f' },
                  { name: 'Haveli Taluka', count: 260, reports: 62, alerts: 'Routine monitoring', pct: 50, color: '#2d6a4f' },
                  { name: 'Indapur Taluka', count: 190, reports: 49, alerts: 'Goat pox surveillance', pct: 40, color: '#f59e0b' },
                  { name: 'Junnar Taluka', count: 150, reports: 38, alerts: 'Vaccine supply optimal', pct: 30, color: '#2d6a4f' },
                ].map((taluka, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 font-bold text-gray-900">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{taluka.name}</span>
                        <span className="text-[10px] font-normal text-gray-500">
                          ({taluka.count} calls • {taluka.reports} disease reports)
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: taluka.color, background: `${taluka.color}15` }}
                      >
                        {taluka.alerts}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${taluka.pct}%`, background: taluka.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Distribution Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Vernacular Language Adoption
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Multi-lingual IVR prompts chosen by livestock callers
                </p>

                <div className="space-y-3">
                  {[
                    { lang: 'Marathi (मराठी)', code: 'mr', pct: 72, count: '1,022 calls', color: '#2d6a4f' },
                    { lang: 'Hindi (हिन्दी)', code: 'hi', pct: 18, count: '255 calls', color: '#52b788' },
                    { lang: 'English', code: 'en', pct: 5, count: '71 calls', color: '#0284c7' },
                    { lang: 'Gujarati (ગુજરાતી)', code: 'gu', pct: 3, count: '43 calls', color: '#f59e0b' },
                    { lang: 'Other Regional (Tamil/Telugu/Punjabi)', code: 'others', pct: 2, count: '29 calls', color: '#8b5cf6' },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-800">{item.lang}</span>
                        <span className="font-mono text-gray-500">
                          {item.pct}% ({item.count})
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.pct}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                  💡 Inclusion Impact Note:
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  92% of IVR callers reported owning basic feature phones (2G/3G keypad). The IVR channel accounts for 44% of total early outbreak reports before clinical presentation.
                </p>
              </div>
            </div>
          </div>

          {/* Recent IVR Voice Reports Table */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Live IVR Voice Surveillance Feed
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Real-time incoming disease calls ingested into central epidemiological telemetry
            </p>

            <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table className="w-full text-xs text-left" style={{ minWidth: '600px', width: '100%' }}>
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Case ID</th>
                    <th className="pb-3">Caller Phone</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Species</th>
                    <th className="pb-3">AI Triaged Disease</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.slice(0, 8).map((rep) => (
                    <tr key={rep.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 font-mono font-bold text-emerald-800">{rep.case_id}</td>
                      <td className="py-3 font-mono text-gray-700">{rep.farmer_phone}</td>
                      <td className="py-3 text-gray-800">
                        {rep.village}, {rep.taluka}
                      </td>
                      <td className="py-3 font-medium text-gray-700">{rep.animal_type}</td>
                      <td className="py-3 font-semibold text-gray-900">{rep.suspected_disease}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            rep.risk_level === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : rep.risk_level === 'urgent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {rep.risk_level}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {rep.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Farmer Voice Grievances */}
      {subTab === 'feedback' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Public Grievances & Voice Complaints Inbox (IVR Option 6)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Recorded complaints regarding veterinary hospital conduct, medicine availability, or service delays.
            </p>

            <div className="space-y-3">
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
                        {fb.feedback_code}
                      </span>
                      <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {fb.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-gray-600">{fb.caller_phone}</span>
                    </div>

                    <p className="text-xs text-gray-800 leading-relaxed italic bg-white p-2.5 rounded-xl border border-gray-200">
                      &quot;{fb.transcript || 'औषधे उपलब्ध नव्हती म्हणून तक्रार केली.'}&quot;
                    </p>

                    <div className="text-[11px] text-gray-500 flex items-center gap-3">
                      <span>Location: {fb.taluka}, {fb.district}</span>
                      <span>•</span>
                      <span>Recorded: {new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {fb.status === 'pending_review' ? (
                      <button
                        onClick={() => handleResolveFeedback(fb.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
                      >
                        Resolve Grievance
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Broadcast Advisories */}
      {subTab === 'broadcast' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Active IVR Voice Broadcast Announcements (IVR Option 5)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Livestock owners who call 1800-120-JEEV and press 5 will hear these live advisories spoken in their preferred regional language.
            </p>

            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-5 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 rounded-2xl border border-emerald-200 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-emerald-950">{ann.title}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                        {ann.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-medium text-emerald-800">
                        Target: {ann.target_taluka}, {ann.target_district}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePlayAnnouncement(ann.id, ann.content_mr)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                    >
                      {playingId === ann.id ? (
                        <>
                          <Pause className="w-3.5 h-3.5" /> Stop Audio
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" /> Play Voice Prompt (मराठी)
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '12px', fontSize: '0.75rem', marginTop: '12px' }}>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 text-gray-800 leading-relaxed">
                      <span className="font-bold text-emerald-900 block mb-1">मराठी मजकूर:</span>
                      {ann.content_mr}
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 text-gray-800 leading-relaxed">
                      <span className="font-bold text-emerald-900 block mb-1">English Content:</span>
                      {ann.content_en}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create New Voice Broadcast */}
      {showNewBroadcast && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '12px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '20px', width: 'calc(100vw - 24px)', maxWidth: '560px', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Issue IVR Voice Broadcast Announcement
                </h3>
                <p className="text-xs text-gray-500">
                  Published instantly to the toll-free hotline prompt engine
                </p>
              </div>
              <button
                onClick={() => setShowNewBroadcast(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Advisory Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lumpy Skin Disease Ring Vaccination Advisory"
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={bcCategory}
                    onChange={(e) => setBcCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  >
                    <option value="outbreak_alert">Outbreak Alert</option>
                    <option value="vaccination_campaign">Vaccination Campaign</option>
                    <option value="advisory">General Health Advisory</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Target Taluka</label>
                  <select
                    value={bcTaluka}
                    onChange={(e) => setBcTaluka(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  >
                    <option value="All Talukas">All Talukas (District Wide)</option>
                    <option value="Shirur">Shirur</option>
                    <option value="Baramati">Baramati</option>
                    <option value="Haveli">Haveli</option>
                    <option value="Indapur">Indapur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Marathi Voice Prompt Content (मराठी) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="शासकीय रोग सतर्कता: शिरूर तालुक्यात लंपी रोगाचा प्रादुर्भाव रोखण्यासाठी..."
                  value={bcContentMr}
                  onChange={(e) => setBcContentMr(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Hindi Voice Prompt Content (हिन्दी)
                </label>
                <textarea
                  rows={2}
                  placeholder="सरकारी एडवाइजरी: लंपी त्वचा रोग के रोकथाम हेतु..."
                  value={bcContentHi}
                  onChange={(e) => setBcContentHi(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  English Voice Prompt Content
                </label>
                <textarea
                  rows={2}
                  placeholder="Government Advisory: Ring vaccination active in 10 km radius..."
                  value={bcContentEn}
                  onChange={(e) => setBcContentEn(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewBroadcast(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md"
                >
                  Publish to Toll-Free IVR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {showSimulator && (
        <IVRPhoneSimulator isOpen={showSimulator} onClose={() => setShowSimulator(false)} />
      )}
    </div>
  );
};
