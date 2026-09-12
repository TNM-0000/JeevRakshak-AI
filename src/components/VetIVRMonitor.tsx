'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  User,
  Activity,
  Send,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  FileAudio,
  ShieldAlert,
} from 'lucide-react';
import { IVRReport, IVRCallbackRequest, IVREmergencyCase } from '@/types/database';
import { dataService } from '@/lib/supabase/dataService';
import { speakIVRPrompt, stopIVRSpeech } from '@/lib/ivr/ivrAudioEngine';

interface VetIVRMonitorProps {
  onOpenPhoneSimulator?: (phone?: string) => void;
  onConvertToCase?: (report: IVRReport) => void;
}

export const VetIVRMonitor: React.FC<VetIVRMonitorProps> = ({
  onOpenPhoneSimulator,
  onConvertToCase,
}) => {
  const [reports, setReports] = useState<IVRReport[]>([]);
  const [callbacks, setCallbacks] = useState<IVRCallbackRequest[]>([]);
  const [emergencies, setEmergencies] = useState<IVREmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'callbacks' | 'emergencies'>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [reps, cbs, emgs] = await Promise.all([
        dataService.getIVRReports(),
        dataService.getIVRCallbacks(),
        dataService.getIVREmergencies(),
      ]);
      setReports(reps);
      setCallbacks(cbs);
      setEmergencies(emgs);
    } catch (err) {
      console.error('Failed to load IVR vet data:', err);
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

  const handlePlayVoice = (id: string, text: string) => {
    if (playingAudioId === id) {
      stopIVRSpeech();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(id);
    speakIVRPrompt(
      text,
      'mr',
      () => setPlayingAudioId(null),
      () => setPlayingAudioId(id)
    );
  };

  const handleAcceptReport = async (reportId: string) => {
    await dataService.updateIVRReportStatus(reportId, 'accepted');
    showToast(`IVR Voice Report accepted and assigned to Dr. Rahul Kulkarni`);
    await loadData();
  };

  const handleCompleteCallback = async (cbId: string) => {
    await dataService.updateIVRCallbackStatus(
      cbId,
      'completed',
      'Doctor called farmer back and provided tele-advice.'
    );
    showToast(`Callback marked as resolved.`);
    await loadData();
  };

  const filteredReports = reports.filter(
    (r) =>
      r.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.farmer_phone.includes(searchQuery) ||
      r.suspected_disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.animal_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCallbacks = callbacks.filter(
    (cb) =>
      cb.farmer_phone.includes(searchQuery) ||
      cb.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cb.animal_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold border border-emerald-600 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/30">
              <Phone className="w-3.5 h-3.5" />
              Toll-Free 1800-120-JEEV Rural Voice Intake Desk
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Veterinary IVR & Tele-Consultation Console
            </h2>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Real-time incoming voice disease reports from non-smartphone livestock owners, automatic speech-to-text transcripts, AI diagnostic triage, and priority callback requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenPhoneSimulator && (
              <button
                onClick={() => onOpenPhoneSimulator()}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition transform hover:scale-105 active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                Launch IVR Phone Simulator
              </button>
            )}
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-xs text-gray-300 block">Total Voice Reports</span>
            <span className="text-2xl font-extrabold text-white">{reports.length}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-xs text-amber-300 block">Pending Callbacks</span>
            <span className="text-2xl font-extrabold text-amber-300">
              {callbacks.filter((c) => c.status === 'pending').length}
            </span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-xs text-rose-300 block">1962 SOS Dispatches</span>
            <span className="text-2xl font-extrabold text-rose-300">{emergencies.length}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-xs text-emerald-300 block">Avg Triage Speed</span>
            <span className="text-2xl font-extrabold text-emerald-300">&lt; 3 mins</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Disease Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('callbacks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'callbacks'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Doctor Callbacks ({callbacks.filter((c) => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('emergencies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'emergencies'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            1962 SOS ({emergencies.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Case ID, phone, disease..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* TAB 1: Voice Disease Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <FileAudio className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No IVR Voice Reports</h3>
              <p className="text-xs text-gray-500 mt-1">
                Voice reports submitted by farmers calling 1800-120-JEEV will show up here automatically.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:border-emerald-300 transition"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {report.case_id}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          report.risk_level === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : report.risk_level === 'urgent'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {report.risk_level} Priority
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(report.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{report.farmer_name || 'Shri Babanrao Babar'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700 font-mono font-medium">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{report.farmer_phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{report.village}, {report.taluka}</span>
                      </div>
                    </div>

                    {/* Vernacular Speech Audio & Transcript Box */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-indigo-600" />
                          Farmer Vernacular Voice Recording & STT Transcript:
                        </span>
                        <button
                          onClick={() => handlePlayVoice(report.id, report.transcript || '')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                        >
                          {playingAudioId === report.id ? (
                            <>
                              <Pause className="w-3 h-3" /> Stop Audio
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" /> Play Audio
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed font-mono italic bg-white p-2.5 rounded-lg border border-slate-200">
                        &quot;{report.transcript || 'जनावराची लक्षणे फोनवर सांगितली.'}&quot;
                      </p>
                    </div>

                    {/* AI Diagnosis and Action Recommendations */}
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-xs font-bold text-emerald-950">
                            AI Triaged Disease: {report.suspected_disease}
                          </span>
                          <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                            {report.ai_confidence_score}% Confidence
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-800 mt-1 flex flex-wrap gap-1">
                          {report.recommended_actions?.slice(0, 2).map((act, i) => (
                            <span key={i} className="inline-block bg-white/70 px-2 py-0.5 rounded border border-emerald-200/60">
                              • {act}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {report.status === 'pending_review' ? (
                          <button
                            onClick={() => handleAcceptReport(report.id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
                          >
                            Accept Case
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-200/70 px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Under Clinical Care
                          </span>
                        )}

                        <a
                          href={`tel:${report.farmer_phone}`}
                          className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 transition"
                          title="Direct Dial Farmer"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Doctor Callbacks */}
      {activeTab === 'callbacks' && (
        <div className="space-y-4">
          {filteredCallbacks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <PhoneCall className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No Pending Callbacks</h3>
              <p className="text-xs text-gray-500 mt-1">
                Farmers who press Option 3 on the IVR to speak with a vet will appear in this queue.
              </p>
            </div>
          ) : (
            filteredCallbacks.map((cb) => (
              <div
                key={cb.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{cb.farmer_name}</span>
                    <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      {cb.farmer_phone}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                        cb.priority === 'urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {cb.priority}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 font-medium">
                    <span className="text-gray-400 font-normal">Reason: </span>
                    {cb.reason}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {cb.village}, {cb.taluka}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(cb.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {cb.status === 'pending' ? (
                    <>
                      <a
                        href={`tel:${cb.farmer_phone}`}
                        onClick={() => handleCompleteCallback(cb.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call Farmer Now
                      </a>
                      <button
                        onClick={() => handleCompleteCallback(cb.id)}
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
                      >
                        Mark Completed
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: 1962 SOS Dispatches */}
      {activeTab === 'emergencies' && (
        <div className="space-y-4">
          {emergencies.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No Active 1962 SOS Cases</h3>
              <p className="text-xs text-gray-500 mt-1">
                Emergency calls made via Toll-Free IVR option 4 appear here immediately.
              </p>
            </div>
          ) : (
            emergencies.map((emg) => (
              <div
                key={emg.id}
                className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-rose-600 text-white px-2.5 py-0.5 rounded-lg">
                      {emg.emergency_code}
                    </span>
                    <span className="text-xs font-bold text-rose-800 uppercase px-2 py-0.5 bg-rose-100 rounded-full">
                      CRITICAL DISPATCH
                    </span>
                    <span className="text-xs font-mono font-semibold text-gray-700">
                      {emg.farmer_phone}
                    </span>
                  </div>

                  <p className="text-xs text-rose-950 font-medium">
                    Animal: <span className="font-bold">{emg.animal_type}</span> • Description:{' '}
                    {emg.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      {emg.village}, {emg.taluka}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-rose-700">
                      Ambulance: {emg.dispatched_unit} (ETA {emg.eta_minutes} mins)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${emg.farmer_phone}`}
                    className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Contact Farmer
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
