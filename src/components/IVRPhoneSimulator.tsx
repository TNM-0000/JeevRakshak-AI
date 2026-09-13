'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  User,
  MapPin,
  RefreshCw,
  X,
  ShieldAlert,
  ShieldCheck,
  Building2,
  FileAudio,
} from 'lucide-react';
import {
  IVRLanguage,
  IVRReport,
  IVREmergencyCase,
  IVRCallbackRequest,
} from '@/types/database';
import {
  IVR_LANGUAGES,
  IVR_PROMPTS,
  SAMPLE_FARMER_TRANSCRIPTS,
  playDTMFTone,
  playBeep,
  playRingtone,
  speakIVRPrompt,
  stopIVRSpeech,
} from '@/lib/ivr/ivrAudioEngine';
import { dataService } from '@/lib/supabase/dataService';

export type IVRState =
  | 'idle'
  | 'dialing'
  | 'ringing'
  | 'connected'
  | 'language_select'
  | 'main_menu'
  | 'disease_animal'
  | 'disease_symptom'
  | 'disease_recording'
  | 'disease_triage'
  | 'disease_complete'
  | 'vaccination_info'
  | 'vet_consult'
  | 'vet_callback_done'
  | 'emergency_prompt'
  | 'emergency_dispatched'
  | 'announcements'
  | 'feedback_recording'
  | 'feedback_complete'
  | 'ended';

interface IVRPhoneSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  autoDial?: boolean;
  initialCallerPhone?: string;
  initialVillage?: string;
  initialTaluka?: string;
  initialDistrict?: string;
}

export const IVRPhoneSimulator: React.FC<IVRPhoneSimulatorProps> = ({
  isOpen,
  onClose,
  autoDial = true,
  initialCallerPhone = '+91 98220 54321',
  initialVillage = 'Shirapur',
  initialTaluka = 'Baramati',
  initialDistrict = 'Pune',
}) => {
  // Caller & Session State
  const [callerPhone, setCallerPhone] = useState(initialCallerPhone);
  const [district, setDistrict] = useState(initialDistrict);
  const [taluka, setTaluka] = useState(initialTaluka);
  const [village, setVillage] = useState(initialVillage);
  const [language, setLanguage] = useState<IVRLanguage>('mr');

  // Call status
  const [ivrState, setIvrState] = useState<IVRState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [digitsHistory, setDigitsHistory] = useState<string>('');
  const [activePromptText, setActivePromptText] = useState<string>('');
  const [isPromptPlaying, setIsPromptPlaying] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [smsNotification, setSmsNotification] = useState<string | null>(null);

  // Disease Report flow state
  const [selectedAnimal, setSelectedAnimal] = useState<string>('Cow');
  const [selectedSymptom, setSelectedSymptom] = useState<string>('Lumpy skin nodules');
  const [submittedReport, setSubmittedReport] = useState<IVRReport | null>(null);
  const [submittedEmergency, setSubmittedEmergency] = useState<IVREmergencyCase | null>(null);
  const [submittedCallback, setSubmittedCallback] = useState<IVRCallbackRequest | null>(null);
  const [feedbackTicket, setFeedbackTicket] = useState<string | null>(null);

  // Audio & Timer references
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ringCancelRef = useRef<(() => void) | null>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);

  // Format seconds as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Speak current prompt helper
  const playPrompt = (text: string, onEnd?: () => void) => {
    setActivePromptText(text);
    if (!isSpeaker) return;
    if (stopSpeechRef.current) stopSpeechRef.current();

    stopSpeechRef.current = speakIVRPrompt(
      text,
      language,
      () => {
        setIsPromptPlaying(false);
        if (onEnd) onEnd();
      },
      () => {
        setIsPromptPlaying(true);
      }
    );
  };

  // 1. Dial Toll-Free Number
  const handleStartCall = () => {
    setCallDuration(0);
    setDigitsHistory('');
    setSmsNotification(null);
    setSubmittedReport(null);
    setSubmittedEmergency(null);
    setSubmittedCallback(null);
    setFeedbackTicket(null);
    setVoiceTranscript('');
    setIvrState('dialing');

    try {
      ringCancelRef.current = playRingtone(1.6);
    } catch (e) {
      console.warn('Ringtone playback:', e);
    }

    setTimeout(() => {
      setIvrState('language_select');
      const langPrompt = `${IVR_PROMPTS[language]?.welcome || ''} ${IVR_PROMPTS[language]?.select_language || ''}`;
      playPrompt(langPrompt);
    }, 1600);
  };

  // Auto-Dial on mount when opened
  useEffect(() => {
    if (isOpen && autoDial) {
      handleStartCall();
    }
  }, [isOpen]);

  // Call duration counter
  useEffect(() => {
    if (ivrState !== 'idle' && ivrState !== 'ended') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ivrState]);

  // Clean up speech and sounds when unmounting or closing
  useEffect(() => {
    return () => {
      stopIVRSpeech();
      if (ringCancelRef.current) ringCancelRef.current();
    };
  }, []);

  if (!isOpen) return null;

  // Simulate Missed Call Service (Auto-Callback)
  const handleMissedCallService = () => {
    setSmsNotification(
      'Missed Call registered from 1800-120-JEEV. JeevRakshak AI auto-callback initiating in 2 seconds...'
    );
    setTimeout(() => {
      setIvrState('ringing');
      try {
        ringCancelRef.current = playRingtone(2);
      } catch (e) {
        console.warn(e);
      }
      setTimeout(() => {
        handleStartCall();
      }, 2000);
    }, 1500);
  };

  // Hang Up Call
  const handleEndCall = () => {
    stopIVRSpeech();
    if (ringCancelRef.current) ringCancelRef.current();
    setIvrState('ended');
    setIsPromptPlaying(false);
    setIsRecordingVoice(false);

    // Register Call in Supabase / LocalStore
    dataService.registerIVRCall({
      caller_phone: callerPhone,
      language,
      duration_seconds: callDuration,
      primary_intent: submittedReport ? 'disease_reporting' : submittedEmergency ? 'emergency_sos' : 'vet_consultation',
      district,
      taluka,
      dtmf_digits: digitsHistory,
    });
  };

  // DTMF Keypad Press Handler
  const handleKeyPress = async (key: string) => {
    playDTMFTone(key);
    setDigitsHistory((prev) => prev + key);

    // Key routing based on current state
    if (ivrState === 'language_select') {
      if (key === '1') setLanguage('mr');
      else if (key === '2') setLanguage('hi');
      else if (key === '3') setLanguage('en');
      else if (key === '4') setLanguage('gu');
      else if (key === '5') setLanguage('pa');
      else if (key === '6') setLanguage('ta');
      else if (key === '7') setLanguage('te');
      else if (key === '8') setLanguage('kn');
      else if (key === '9') setLanguage('bn');

      const targetLang: IVRLanguage =
        key === '1' ? 'mr' : key === '2' ? 'hi' : key === '3' ? 'en' : 'mr';

      setIvrState('main_menu');
      playPrompt(IVR_PROMPTS[targetLang].main_menu);
      return;
    }

    if (ivrState === 'main_menu') {
      switch (key) {
        case '1': // Disease Report
          setIvrState('disease_animal');
          playPrompt(IVR_PROMPTS[language].disease_select_animal);
          break;
        case '2': // Vaccination Info
          setIvrState('vaccination_info');
          playPrompt(IVR_PROMPTS[language].vaccination_info);
          break;
        case '3': // Veterinary Consultation
          setIvrState('vet_consult');
          playPrompt(IVR_PROMPTS[language].doctor_consult_menu);
          break;
        case '4': // Emergency SOS 1962
          setIvrState('emergency_prompt');
          playPrompt(IVR_PROMPTS[language].emergency_prompt);
          break;
        case '5': // Announcements
          setIvrState('announcements');
          playPrompt(IVR_PROMPTS[language].announcements_prompt);
          break;
        case '6': // Complaints / Feedback
          setIvrState('feedback_recording');
          playPrompt(IVR_PROMPTS[language].feedback_prompt);
          break;
        case '0': // Repeat
          playPrompt(IVR_PROMPTS[language].main_menu);
          break;
        default:
          playPrompt(IVR_PROMPTS[language].invalid_input);
      }
      return;
    }

    // Disease: Select Animal
    if (ivrState === 'disease_animal') {
      const animals = ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Other'];
      const index = parseInt(key, 10) - 1;
      if (index >= 0 && index < animals.length) {
        setSelectedAnimal(animals[index]);
        setIvrState('disease_symptom');
        playPrompt(IVR_PROMPTS[language].disease_select_symptom);
      } else {
        playPrompt(IVR_PROMPTS[language].invalid_input);
      }
      return;
    }

    // Disease: Select Symptom
    if (ivrState === 'disease_symptom') {
      const symptoms = [
        'High Fever',
        'Blisters in mouth or feet',
        'Lumpy skin nodules',
        'Loss of appetite',
        'Respiratory distress',
        'Other symptoms',
      ];
      const index = parseInt(key, 10) - 1;
      if (index >= 0 && index < symptoms.length) {
        setSelectedSymptom(symptoms[index]);
        setIvrState('disease_recording');
        playPrompt(IVR_PROMPTS[language].disease_record_prompt, () => {
          setIsRecordingVoice(true);
          playBeep(1000, 350);
        });
      } else {
        playPrompt(IVR_PROMPTS[language].invalid_input);
      }
      return;
    }

    // Finish voice recording when pressing #
    if (key === '#') {
      if (ivrState === 'disease_recording') {
        finishVoiceDiseaseReport();
        return;
      }
      if (ivrState === 'feedback_recording') {
        finishFeedbackRecording();
        return;
      }
    }

    // Emergency prompt confirm 1
    if (ivrState === 'emergency_prompt') {
      if (key === '1') {
        const emergencyCase = await dataService.createIVREmergencyCase({
          caller_phone: callerPhone,
          animal_type: selectedAnimal,
          description: `Voice 1962 Emergency initiated from ${village}, ${taluka}`,
          village,
          taluka,
          district,
        });
        setSubmittedEmergency(emergencyCase);
        setIvrState('emergency_dispatched');
        const prompt = IVR_PROMPTS[language].emergency_dispatched.replace(
          '{code}',
          emergencyCase.emergency_code
        );
        playPrompt(prompt);
      } else {
        setIvrState('main_menu');
        playPrompt(IVR_PROMPTS[language].main_menu);
      }
      return;
    }

    // Doctor callback confirm 1
    if (ivrState === 'vet_consult') {
      if (key === '1') {
        const callbackReq = await dataService.createIVRCallbackRequest({
          caller_phone: callerPhone,
          farmer_name: 'Shri Babanrao Babar',
          animal_type: selectedAnimal,
          reason: `Urgent tele-consultation requested via 1800-120-JEEV`,
          taluka,
          district,
          priority: 'urgent',
        });
        setSubmittedCallback(callbackReq);
        setIvrState('vet_callback_done');
        playPrompt(IVR_PROMPTS[language].doctor_callback_success);
      } else {
        setIvrState('main_menu');
        playPrompt(IVR_PROMPTS[language].main_menu);
      }
      return;
    }
  };

  // Automated voice report generator
  const finishVoiceDiseaseReport = async () => {
    setIsRecordingVoice(false);
    setIvrState('disease_triage');

    let transcript = SAMPLE_FARMER_TRANSCRIPTS.cow_lumpy.transcript_mr;
    if (language === 'hi') transcript = SAMPLE_FARMER_TRANSCRIPTS.cow_lumpy.transcript_hi;
    else if (language === 'en') transcript = SAMPLE_FARMER_TRANSCRIPTS.cow_lumpy.transcript_en;

    setVoiceTranscript(transcript);

    const report = await dataService.submitIVRDiseaseReport({
      caller_phone: callerPhone,
      farmer_name: 'Shri Babanrao Babar',
      detected_language: language,
      animal_type: selectedAnimal,
      symptoms: [selectedSymptom],
      raw_transcript: transcript,
      village,
      taluka,
      district,
    });

    setSubmittedReport(report);
    setIvrState('disease_complete');
    const prompt = IVR_PROMPTS[language].disease_success.replace('{caseId}', report.case_id);
    playPrompt(prompt);
  };

  const finishFeedbackRecording = async () => {
    setIsRecordingVoice(false);
    const ticketId = `GRV-${Date.now().toString().slice(-5)}`;
    setFeedbackTicket(ticketId);
    setIvrState('feedback_complete');
    const prompt = IVR_PROMPTS[language].feedback_success.replace('{ticketId}', ticketId);
    playPrompt(prompt);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 2000 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1000px',
          width: '95vw',
          maxHeight: '92vh',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.35)',
          background: '#ffffff',
          border: '1px solid var(--border-card)',
        }}
      >
        {/* Top Government & Toll-Free Header Banner (Theme Signature) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
            padding: '16px 24px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#95d5b2',
              }}
            >
              <Phone size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  1800-120-JEEV (5338)
                </span>
                <span
                  style={{
                    background: '#52b788',
                    color: '#081c15',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  Toll-Free • 24x7
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#d8f3dc', margin: 0 }}>
                महाराष्ट्र शासन • पशुसंवर्धन विभाग | Rural IVR Voice Helpline (Zero Internet Needed)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href="tel:18001205338"
              className="btn-primary"
              style={{
                background: '#52b788',
                color: '#081c15',
                fontSize: '0.74rem',
                padding: '6px 14px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
              title="Dial on actual phone app"
            >
              <PhoneCall size={13} />
              <span>Direct Phone Dial</span>
            </a>

            <button
              onClick={() => {
                handleEndCall();
                onClose();
              }}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Close Simulator"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Column Interactive Layout */}
        <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, overflowY: 'auto' }}>
          {/* LEFT COLUMN: Phone Handset Mockup (Green/Emerald Theme) */}
          <div
            style={{
              flex: '1 1 360px',
              maxWidth: '440px',
              padding: '24px 20px',
              background: '#f8fafc',
              borderRight: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Phone Screen Shell */}
            <div
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '340px',
                borderRadius: '24px',
                padding: '16px',
                background: '#ffffff',
                border: '2px solid #bbf7d0',
                boxShadow: '0 10px 25px rgba(45, 106, 79, 0.12)',
              }}
            >
              {/* Status Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#52796f', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Radio size={12} color="#16a34a" />
                  <span style={{ fontWeight: 600 }}>BSNL 4G | Jio</span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.66rem' }}>
                  100%
                </span>
              </div>

              {/* Call Status Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
                  borderRadius: '16px',
                  padding: '14px',
                  textAlign: 'center',
                  color: '#ffffff',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.66rem', fontWeight: 700, color: '#95d5b2', marginBottom: '4px' }}>
                  <ShieldCheck size={12} />
                  <span>महाराष्ट्र शासन • Toll-Free</span>
                </div>

                <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.02em', color: '#ffffff' }}>
                  1800-120-JEEV
                </div>
                <div style={{ fontSize: '0.72rem', color: '#d8f3dc' }}>
                  JeevRakshak AI Livestock Health Line
                </div>

                {/* Status Indicator */}
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.76rem' }}>
                  {ivrState === 'idle' && (
                    <span style={{ color: '#fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                      Ready to Dial
                    </span>
                  )}
                  {ivrState === 'dialing' && (
                    <span style={{ color: '#93c5fd', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <div className="animate-spin" style={{ width: '10px', height: '10px', border: '2px solid #93c5fd', borderTopColor: 'transparent', borderRadius: '50%' }} />
                      Dialing Toll-Free...
                    </span>
                  )}
                  {ivrState === 'ringing' && (
                    <span style={{ color: '#86efac', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <PhoneCall size={12} /> Ringing...
                    </span>
                  )}
                  {ivrState !== 'idle' && ivrState !== 'dialing' && ivrState !== 'ringing' && ivrState !== 'ended' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#86efac' }}>
                        Connected {formatTime(callDuration)}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                        {IVR_LANGUAGES.find((l) => l.code === language)?.nativeName}
                      </span>
                    </div>
                  )}
                  {ivrState === 'ended' && (
                    <span style={{ color: '#fca5a5' }}>Call Ended ({formatTime(callDuration)})</span>
                  )}
                </div>
              </div>

              {/* Voice Prompt & TTS Teleprompter */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  border: '1px solid var(--border-subtle)',
                  minHeight: '70px',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#52796f', marginBottom: '4px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                    <Volume2 size={12} color="#2d6a4f" />
                    IVR Voice Prompt:
                  </span>
                  {isPromptPlaying && (
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.64rem' }}>
                      Playing Audio...
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.76rem', color: '#1b4332', fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>
                  {activePromptText || (ivrState === 'idle' ? 'Click "Call 1800-120-JEEV" below to start.' : 'Listening for options...')}
                </p>
              </div>

              {/* Waveform indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', height: '20px', marginBottom: '10px', background: '#f0fdf4', borderRadius: '8px', padding: '0 8px' }}>
                {[30, 60, 25, 75, 50, 85, 40, 70, 45, 55, 25, 80, 40, 65, 30].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      width: '3px',
                      height: isPromptPlaying || isRecordingVoice ? `${Math.max(4, (h * (i % 3 + 1)) % 16)}px` : '4px',
                      background: isPromptPlaying || isRecordingVoice ? '#2d6a4f' : '#cbd5e1',
                      borderRadius: '2px',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
                {isRecordingVoice && (
                  <span style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 800, marginLeft: '6px' }}>
                    REC (# to finish)
                  </span>
                )}
              </div>

              {/* DTMF Keypad Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
                {[
                  { num: '1', letters: 'Disease / भाषा' },
                  { num: '2', letters: 'Vaccines / लसी' },
                  { num: '3', letters: 'Doctor / सल्ला' },
                  { num: '4', letters: '1962 SOS' },
                  { num: '5', letters: 'Alerts / सूचना' },
                  { num: '6', letters: 'Feedback' },
                  { num: '7', letters: 'PQRS' },
                  { num: '8', letters: 'TUV' },
                  { num: '9', letters: 'WXYZ' },
                  { num: '*', letters: 'Repeat' },
                  { num: '0', letters: 'Menu' },
                  { num: '#', letters: 'Finish REC' },
                ].map((keyItem) => (
                  <button
                    key={keyItem.num}
                    type="button"
                    onClick={() => handleKeyPress(keyItem.num)}
                    disabled={ivrState === 'idle' || ivrState === 'dialing' || ivrState === 'ended'}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                      opacity: ivrState === 'idle' || ivrState === 'ended' ? 0.45 : 1,
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1b4332', lineHeight: 1.1 }}>
                      {keyItem.num}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75px' }}>
                      {keyItem.letters}
                    </span>
                  </button>
                ))}
              </div>

              {/* Call Controls Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                {/* Speaker Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isSpeaker ? '#dcfce7' : '#f1f5f9',
                    color: isSpeaker ? '#166534' : '#64748b',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title={isSpeaker ? 'Speaker ON' : 'Speaker OFF'}
                >
                  {isSpeaker ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                {/* Primary Call / End Action Button */}
                {ivrState === 'idle' || ivrState === 'ended' ? (
                  <button
                    type="button"
                    onClick={handleStartCall}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(45, 106, 79, 0.35)',
                      cursor: 'pointer',
                    }}
                    title="Call 1800-120-JEEV"
                  >
                    <Phone size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEndCall}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
                      cursor: 'pointer',
                    }}
                    title="Hang Up"
                  >
                    <PhoneOff size={20} />
                  </button>
                )}

                {/* Mute Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isMuted ? '#fee2e2' : '#f1f5f9',
                    color: isMuted ? '#dc2626' : '#64748b',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title={isMuted ? 'Muted' : 'Unmuted'}
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>

              {/* Missed call link */}
              {ivrState === 'idle' && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleMissedCallService}
                    style={{ fontSize: '0.72rem', color: '#2d6a4f', textDecoration: 'underline', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Simulate Missed Call Service (Auto-Callback)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Control Desk & Telemetry (Website Design System) */}
          <div style={{ flex: '1 1 400px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Session Caller Profile */}
            <div className="glass-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="var(--primary)" />
                  Simulated Rural Caller
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  PSTN / Telecom Loop
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', height: '34px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '4px' }}>Location (Taluka / Village)</label>
                  <input
                    type="text"
                    value={`${village}, ${taluka}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      setVillage(parts[0]?.trim() || village);
                      setTaluka(parts[1]?.trim() || taluka);
                    }}
                    className="form-input"
                    style={{ fontSize: '0.8rem', height: '34px' }}
                  />
                </div>
              </div>

              {/* Language Selector Chips */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '6px', display: 'block' }}>
                  Language Preference ({IVR_LANGUAGES.length} Regional Indian Languages):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {IVR_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        if (ivrState !== 'idle' && ivrState !== 'ended') {
                          playPrompt(IVR_PROMPTS[lang.code].main_menu);
                        }
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '0.72rem',
                        fontWeight: language === lang.code ? 800 : 500,
                        background: language === lang.code ? '#2d6a4f' : '#f1f5f9',
                        color: language === lang.code ? '#ffffff' : 'var(--text-main)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {lang.nativeName} ({lang.name})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick 1-Click Test Scenarios */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fff9 0%, #f0fdf4 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                border: '1.5px dashed #52b788',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1b4332', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="#2d6a4f" />
                  Quick Automated Scenarios (1-Click Test)
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2d6a4f' }}>
                  Demo Automation
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleStartCall();
                    setTimeout(() => {
                      setLanguage('mr');
                      setSelectedAnimal('Cow');
                      setSelectedSymptom('Lumpy skin nodules');
                      setIvrState('disease_recording');
                      finishVoiceDiseaseReport();
                    }, 2000);
                  }}
                  className="glass-card"
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: '#ffffff',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#065f46' }}>
                    🐄 Lumpy Skin Voice Report
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#047857' }}>
                    Cow, Nodules, Marathi Audio, AI Triage
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleStartCall();
                    setTimeout(() => {
                      setLanguage('hi');
                      setSelectedAnimal('Buffalo');
                      setSelectedSymptom('Blisters in mouth or feet');
                      setIvrState('disease_recording');
                      finishVoiceDiseaseReport();
                    }, 2000);
                  }}
                  className="glass-card"
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: '#ffffff',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#065f46' }}>
                    🐃 FMD Contagious Report
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#047857' }}>
                    Buffalo, Blisters, Hindi STT, Urgent Alert
                  </div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    handleStartCall();
                    setTimeout(() => {
                      setIvrState('emergency_prompt');
                      handleKeyPress('1');
                    }, 2000);
                  }}
                  className="glass-card"
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: '#ffffff',
                    border: '1px solid #fecaca',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#dc2626' }}>
                    🚨 1962 SOS Emergency Call
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#991b1b' }}>
                    Critical Dispatch, GPS ambulance dispatch
                  </div>
                </button>
              </div>
            </div>

            {/* Generated Reports & Status Feedback */}
            {submittedReport && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#065f46' }}>
                    IVR Case {submittedReport.case_id} Registered Permanently
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#047857', lineHeight: 1.5 }}>
                  <strong>Suspected:</strong> {submittedReport.suspected_disease} ({submittedReport.ai_confidence_score}% Confidence) •{' '}
                  <strong>Caller:</strong> {submittedReport.farmer_phone} • {submittedReport.village}
                </div>
              </div>
            )}

            {submittedEmergency && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <AlertTriangle size={18} color="#dc2626" />
                  <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#991b1b' }}>
                    1962 SOS Ambulance Dispatched ({submittedEmergency.emergency_code})
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#7f1d1d' }}>
                  Mobile Veterinary Unit dispatched to {submittedEmergency.village}. Doctor notified.
                </div>
              </div>
            )}

            {smsNotification && (
              <div
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  color: '#0369a1',
                }}
              >
                {smsNotification}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
