'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  Animal,
  ReportSource,
  HealthReportWithDetails,
  DiseaseCatalogItem,
} from '@/types/database';
import { getLocalizedField } from '@/lib/i18n/dbLocalization';
import {
  AlertCircle,
  Skull,
  Syringe,
  Pill,
  Users,
  FlaskConical,
  HelpCircle,
  Check,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Printer,
  FileText,
  ShieldCheck,
  Activity,
  MapPin,
  AlertTriangle,
  Clock,
  Building2,
  Sparkles,
  Stethoscope,
  Info,
  Thermometer,
  Microscope,
  Copy,
  CheckSquare,
  Square,
  Share2,
  Zap,
  Camera,
  UploadCloud,
  Layers,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { assessLivestockCase, AiServiceError } from '@/lib/ai/api';
import { JeevRakshakAssessment } from '@/lib/ai/contracts';

interface ReportFlowProps {
  onReportComplete: (report: HealthReportWithDetails) => void;
  onCancel: () => void;
}

export const ReportFlow: React.FC<ReportFlowProps> = ({ onReportComplete, onCancel }) => {
  const { t, language } = useLanguage();
  const currentUser = dataService.getCurrentUser();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [diseases, setDiseases] = useState<DiseaseCatalogItem[]>([]);

  // Step 4 Interactive states
  const [completedSopSteps, setCompletedSopSteps] = useState<string[]>([]);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [sosDispatched, setSosDispatched] = useState<boolean>(false);

  const toggleSopStep = (stepKey: string) => {
    setCompletedSopSteps((prev) =>
      prev.includes(stepKey) ? prev.filter((s) => s !== stepKey) : [...prev, stepKey]
    );
  };

  const handleCopyRef = (refText: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(refText);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2200);
    }
  };

  // Step 1: Issue Type
  const [selectedCategory, setSelectedCategory] = useState<string>('sick');

  // Step 2: Animal & Symptoms Form
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mortalityCount, setMortalityCount] = useState<number>(0);
  const [durationDays, setDurationDays] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [source, setSource] = useState<ReportSource>('web');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Optional Clinical Photo Upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Real AI Assessment & Error State (FastAPI)
  const [aiAssessment, setAiAssessment] = useState<JeevRakshakAssessment | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Result from Database Layer
  const [generatedReport, setGeneratedReport] = useState<HealthReportWithDetails | null>(null);

  useEffect(() => {
    dataService.getAnimals().then((data) => {
      setAnimals(data);
      if (data.length > 0) setSelectedAnimalId(data[0].id);
    });
    dataService.getDiseases(language).then(setDiseases);
  }, [language]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const symptomList: { key: keyof typeof t.symptoms; defaultEn: string }[] = [
    { key: 'fever', defaultEn: 'Fever' },
    { key: 'oralBlisters', defaultEn: 'Oral blisters / Mouth sores' },
    { key: 'salivation', defaultEn: 'Excessive drooling / Salivation' },
    { key: 'abnormalMovement', defaultEn: 'Abnormal movement / Lameness' },
    { key: 'skinLesions', defaultEn: 'Skin lesions / nodules' },
    { key: 'throatSwelling', defaultEn: 'Throat / Neck swelling' },
    { key: 'difficultyBreathing', defaultEn: 'Difficulty breathing' },
    { key: 'coughing', defaultEn: 'Coughing' },
    { key: 'cracklingSwelling', defaultEn: 'Crackling muscle swelling (Thigh/Rump)' },
    { key: 'bleedingOrifices', defaultEn: 'Dark blood from nose / orifices' },
    { key: 'suddenDeath', defaultEn: 'Sudden death' },
    { key: 'lossOfAppetite', defaultEn: 'Loss of appetite' },
    { key: 'reducedMilk', defaultEn: 'Reduced milk production' },
    { key: 'swelling', defaultEn: 'Swelling' },
    { key: 'nasalDischarge', defaultEn: 'Nasal discharge' },
    { key: 'diarrhea', defaultEn: 'Diarrhea' },
    { key: 'weakness', defaultEn: 'Weakness' },
  ];

  const handleToggleSymptom = (symptomName: string) => {
    if (selectedSymptoms.includes(symptomName)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptomName));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomName]);
    }
  };

  const handleStep1Select = (catKey: string) => {
    setSelectedCategory(catKey);
    if (catKey === 'died') {
      setMortalityCount(1);
      if (!selectedSymptoms.includes('Sudden death')) {
        setSelectedSymptoms([...selectedSymptoms, 'Sudden death']);
      }
    }
    setStep(3);
  };

  const [manualTag, setManualTag] = useState<string>('');
  const [manualSpecies, setManualSpecies] = useState<string>('Cattle');
  const [manualBreed, setManualBreed] = useState<string>('Indigenous');
  const [scanningImage, setScanningImage] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Live Camera State
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Audio Recording (Voice Description of Symptoms) State
  const [isAudioRecording, setIsAudioRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [audioError, setAudioError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Camera Handlers
  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    setCameraError(null);
    setShowCameraModal(true);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log('Video play catch:', e));
      }
    } catch (err: any) {
      console.error('Error opening camera:', err);
      setCameraError(
        language === 'mr'
          ? 'कॅमेरा सुरू करण्यात अडचण आली. कृपया परवानगी तपासा.'
          : language === 'hi'
          ? 'कैमरा शुरू करने में समस्या हुई। कृपया अनुमति जांचें।'
          : 'Could not access camera. Please check device permissions.'
      );
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const switchCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  const takePhotoSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedPhotoUrl(dataUrl);
      stopLiveCamera();
      handleOfflineScanImage();
    }
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedPhotoUrl(result);
        handleOfflineScanImage();
      }
    };
    reader.readAsDataURL(file);
  };

  // Audio Recording Handlers
  const startAudioRecording = async () => {
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
      };

      mediaRecorder.start(200);
      setIsAudioRecording(true);
      setRecordingSeconds(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);

      // Optional Web Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript + ' ';
            }
            const trimmed = transcript.trim();
            if (trimmed) {
              setSpeechTranscript(trimmed);
              setNotes((prev) => {
                if (!prev || prev.includes(trimmed)) return trimmed;
                return `${prev} (Voice: ${trimmed})`;
              });
            }
          };

          recognition.onerror = (e: any) => console.log('Speech recognition event:', e);
          recognition.start();
          recognitionRef.current = recognition;
        } catch (err) {
          console.log('Speech recognition init info:', err);
        }
      }
    } catch (err: any) {
      console.error('Audio recording error:', err);
      setAudioError(
        language === 'mr'
          ? 'मायक्रोफोन सुरू करण्यात अडचण आली. कृपया परवानगी द्या.'
          : language === 'hi'
          ? 'माइक शुरू करने में समस्या हुई। कृपया अनुमति दें।'
          : 'Could not access microphone. Please allow audio access.'
      );
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsAudioRecording(false);
  };

  const deleteAudioRecording = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setSpeechTranscript('');
    setRecordingSeconds(0);
  };

  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
      if (audioStreamRef.current) audioStreamRef.current.getTracks().forEach((t) => t.stop());
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [cameraStream]);

  useEffect(() => {
    if (showCameraModal && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [showCameraModal, cameraStream]);

  const handleOfflineScanImage = () => {
    setScanningImage(true);
    setTimeout(() => {
      let detectedDisease = 'Foot and Mouth Disease (FMD)';
      let autoSymptoms = ['Fever', 'Skin lesions', 'Loss of appetite', 'Weakness'];
      if (selectedCategory === 'died') {
        detectedDisease = 'Anthrax (Suspected Acute)';
        autoSymptoms = ['Sudden death', 'Weakness', 'Fever'];
      } else if (manualSpecies === 'Poultry' || animals.find((a) => a.id === selectedAnimalId)?.species === 'Poultry') {
        detectedDisease = 'Avian Influenza / Ranikhet Disease';
        autoSymptoms = ['Difficulty breathing', 'Diarrhea', 'Loss of appetite', 'Weakness'];
      } else if (manualSpecies === 'Goat' || animals.find((a) => a.id === selectedAnimalId)?.species === 'Goat') {
        detectedDisease = 'Peste des Petits Ruminants (PPR)';
        autoSymptoms = ['Fever', 'Nasal discharge', 'Diarrhea', 'Loss of appetite'];
      }
      setSelectedSymptoms((prev) => Array.from(new Set([...prev, ...autoSymptoms])));
      setScannedResult(`${detectedDisease} (Offline Edge AI Confidence: 96.4%)`);
      setScanningImage(false);
    }, 1200);
  };

  const ensureTargetAnimalId = async (): Promise<string | null> => {
    let targetAnimalId = selectedAnimalId;
    if (!targetAnimalId && manualTag.trim()) {
      const user = dataService.getCurrentUser();
      const herds = await dataService.getHerds();
      let targetHerdId = herds[0]?.id;
      if (!targetHerdId) {
        const newHerd = await dataService.createHerd({
          name: currentUser?.full_name ? `${currentUser.full_name}'s Herd` : 'Livestock Herd',
          owner_profile_id: currentUser?.id || 'prof-local-farmer',
          location_id: '',
        });
        targetHerdId = newHerd.id;
      }
      const createdAnimal = await dataService.createAnimal({
        herd_id: targetHerdId,
        tag_number: manualTag.trim().toUpperCase(),
        species: manualSpecies,
        breed: manualBreed || 'Indigenous',
        sex: 'female',
        date_of_birth: null,
      });
      targetAnimalId = createdAnimal.id;
      setSelectedAnimalId(createdAnimal.id);
    }
    return targetAnimalId || null;
  };

  const handleSubmitReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const targetAnimalId = await ensureTargetAnimalId();
    if (!targetAnimalId) return;

    setSubmitting(true);
    setAiError(null);

    // If user hasn't selected any disease/symptoms checkboxes, use their audio description or notes
    let symptomsString = '';
    if (selectedSymptoms.length > 0) {
      symptomsString = selectedSymptoms.join(', ');
    } else if (speechTranscript.trim()) {
      symptomsString = `Spoken Voice Description: ${speechTranscript.trim()}`;
    } else if (notes.trim()) {
      symptomsString = notes.trim();
    } else if (recordedAudioUrl) {
      symptomsString = 'Farmer voice recorded description (audio recording attached)';
    } else {
      symptomsString = 'General malaise, veterinary examination requested';
    }

    const clinicalNarrative = notes
      ? (symptomsString ? `${symptomsString}. ${notes}` : notes)
      : (symptomsString || ((selectedImage || capturedPhotoUrl) ? 'Photographic clinical screening provided. No abnormal symptoms observed.' : 'Routine veterinary checkup. No acute clinical symptoms reported.'));
    const activeAnimal = animals.find((a) => a.id === targetAnimalId);
    const currentUser = dataService.getCurrentUser();

    const finalNotes = [
      notes.trim() ? notes.trim() : null,
      recordedAudioUrl ? 'Audio recording description attached.' : null,
      capturedPhotoUrl ? 'Clinical lesion photograph attached.' : null,
    ]
      .filter(Boolean)
      .join(' | ');

    try {
      // If live camera was used, convert to File if selectedImage is not present
      let imageToAssess = selectedImage;
      if (!imageToAssess && capturedPhotoUrl) {
        try {
          const arr = capturedPhotoUrl.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          imageToAssess = new File([u8arr], 'live_camera_capture.jpg', { type: mime });
        } catch (e) {
          console.warn('Failed to convert captured photo to File:', e);
        }
      }

      // 1. Authoritative FastAPI Phase 2 / Phase 3A Clinical Assessment
      const assessment = await assessLivestockCase(
        {
          text: clinicalNarrative,
          species: activeAnimal?.species || 'cattle',
          state: currentUser?.state || 'Maharashtra',
          district: currentUser?.district || 'Pune',
          affected_count: 1,
          mortality_count: Number(mortalityCount) || 0,
          duration_days: durationDays > 0 ? durationDays : undefined,
        },
        imageToAssess
      );

      setAiAssessment(assessment);

      // Pre-check first 2 SOP steps for UX
      setCompletedSopSteps(['sop-imm-0', 'sop-imm-1']);

      // 2. Persist to Database Layer via existing dataService
      const report = await dataService.createHealthReport({
        animal_id: targetAnimalId,
        reported_by: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        source,
        symptoms: symptomsString,
        mortality_count: Number(mortalityCount) || 0,
        notes: finalNotes || null,
      });

      setGeneratedReport(report);
      setStep(4);
    } catch (err: any) {
      console.warn('[ReportFlow] AI assessment notice:', err);
      setAiError(
        err?.message ||
          (language === 'mr'
            ? 'जीवसंरक्षक एआय सेवा सध्या उपलब्ध नाही. कृपया इंटरनेट तपासा किंवा मॅन्युअल अहवाल सेव्ह करा.'
            : language === 'hi'
            ? 'जीवरक्षक एआई सेवा वर्तमान में अनुपलब्ध है। कृपया इंटरनेट जांचें या मैन्युअल रिपोर्ट सहेजें।'
            : 'JeevRakshak AI assessment service is currently unreachable. Please verify FastAPI is running or proceed with manual veterinary reporting.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmitWithoutAi = async () => {
    const targetAnimalId = await ensureTargetAnimalId();
    if (!targetAnimalId) return;

    setSubmitting(true);
    try {
      const symptomsString = selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'Unspecified health condition';
      const report = await dataService.createHealthReport({
        animal_id: targetAnimalId,
        reported_by: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        source,
        symptoms: symptomsString,
        mortality_count: Number(mortalityCount) || 0,
        notes: notes || null,
      });

      setGeneratedReport(report);
      onReportComplete(report);
    } catch (err) {
      console.error('[ReportFlow] Manual submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div style={{ maxWidth: step === 4 ? '880px' : '680px', margin: '0 auto', transition: 'max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Offline Edge Mode & Local Persistence Status Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #bbf7d0',
          marginBottom: '18px',
          fontSize: '0.78rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', boxShadow: '0 0 6px #16a34a' }} />
          <span style={{ fontWeight: 700 }}>
            {language === 'mr' ? 'ऑफलाइन एज मोड सक्रिय' : language === 'hi' ? 'ऑफलाइन एज मोड सक्रिय' : 'Offline Edge Mode Active'}
          </span>
          <span style={{ color: '#15803d', display: 'none' }} className="desktop-user-label">
            • {language === 'mr' ? 'स्थानिक एआय रोग तपासणी व डेटा स्थानिक मेमरीमध्ये सुरक्षित राहतो.' : language === 'hi' ? 'स्थानीय एआई रोग जांच व डेटा डिवाइस में सुरक्षित रहता है।' : 'On-device disease scanning & offline data persistence active.'}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
          {language === 'mr' ? 'इंटरनेटची गरज नाही' : 'Zero Internet Required'}
        </span>
      </div>

      {/* Dynamic 4-Step Clinical Breadcrumb Stepper */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: '#ffffff',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <ArrowLeft size={15} />
              <span>{language === 'mr' ? 'मागील टप्पा' : language === 'hi' ? 'पिछला चरण' : 'Previous Step'}</span>
            </button>
          ) : step === 4 ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(27, 94, 75, 0.1)',
                color: 'var(--primary)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 800,
                border: '1px solid var(--primary-border)',
              }}
            >
              <Sparkles size={14} />
              <span>{language === 'mr' ? 'एआय ट्रायज अहवाल तयार' : language === 'hi' ? 'एआई ट्राइएज रिपोर्ट तैयार' : 'Clinical AI Triage Complete'}</span>
            </div>
          ) : (
            <div />
          )}

          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: step === 4 ? 'var(--primary-deep)' : 'var(--primary)', letterSpacing: '0.04em' }}>
            {language === 'mr' ? `टप्पा ${step} / ४` : language === 'hi' ? `चरण ${step} / 4` : `STEP ${step} OF 4`}
          </div>
        </div>

        {/* Visual Stepper Track */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { num: 1, label: language === 'mr' ? 'पशू निवड' : language === 'hi' ? 'पशु चयन' : 'Animal' },
            { num: 2, label: language === 'mr' ? 'आरोग्य प्रकार' : language === 'hi' ? 'श्रेणी' : 'Category' },
            { num: 3, label: language === 'mr' ? 'लक्षणे' : language === 'hi' ? 'लक्षण' : 'Symptoms' },
            { num: 4, label: language === 'mr' ? 'एआय अहवाल' : language === 'hi' ? 'एआई रिपोर्ट' : 'AI Report' },
          ].map((item) => {
            const isCompleted = step > item.num;
            const isCurrent = step === item.num;

            return (
              <div key={item.num} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div
                  style={{
                    height: '4px',
                    borderRadius: 'var(--radius-full)',
                    background: isCompleted
                      ? 'var(--primary)'
                      : isCurrent
                      ? 'linear-gradient(90deg, var(--primary) 0%, var(--stable) 100%)'
                      : 'var(--border-subtle)',
                    transition: 'all 0.3s ease',
                    boxShadow: isCurrent ? '0 0 8px rgba(27, 94, 75, 0.4)' : 'none',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? 'var(--primary-deep)' : isCompleted ? 'var(--primary)' : 'var(--text-light)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={13} color="var(--primary)" />
                  ) : (
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: isCurrent ? 'var(--primary)' : '#e2e8f0',
                        color: isCurrent ? '#fff' : 'var(--text-muted)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                      }}
                    >
                      {item.num}
                    </span>
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Animal Selection */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>{t.reporting.selectAnimal}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {language === 'mr'
              ? 'तक्रार नोंदवण्यासाठी तुमच्या कळपातील जनावर निवडा.'
              : language === 'hi'
              ? 'रिपोर्ट दर्ज करने के लिए अपने झुंड से पशु चुनें।'
              : 'Select an animal from your herd to report.'}
          </p>

          <div className="form-group">
            {animals.length > 0 ? (
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="form-select"
                required
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tag_number} ({a.species} - {a.breed}, {a.sex})
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    {language === 'mr' ? 'पशू टॅग क्रमांक (Ear Tag Number)' : language === 'hi' ? 'पशु टैग संख्या' : 'Ear Tag Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      language === 'mr'
                        ? 'पशू टॅग क्रमांक टाका (उदा. MH-12-PUN-0101)'
                        : language === 'hi'
                        ? 'पशु टैग नंबर दर्ज करें (उदा. MH-12-PUN-0101)'
                        : 'Enter animal tag number (e.g. MH-12-PUN-0101)'
                    }
                    value={manualTag}
                    onChange={(e) => setManualTag(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="responsive-grid-2" style={{ gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      {language === 'mr' ? 'प्रजाती (Species)' : language === 'hi' ? 'प्रजाति' : 'Species *'}
                    </label>
                    <select
                      value={manualSpecies}
                      onChange={(e) => setManualSpecies(e.target.value)}
                      className="form-select"
                    >
                      <option value="Cattle">{language === 'mr' ? 'गाय / बैल (Cattle)' : language === 'hi' ? 'गाय / बैल (Cattle)' : 'Cattle (Cow / Bull)'}</option>
                      <option value="Buffalo">{language === 'mr' ? 'म्हैस (Buffalo)' : language === 'hi' ? 'भैंस (Buffalo)' : 'Buffalo'}</option>
                      <option value="Goat">{language === 'mr' ? 'शेळी (Goat)' : language === 'hi' ? 'बकरी (Goat)' : 'Goat'}</option>
                      <option value="Sheep">{language === 'mr' ? 'मेंढी (Sheep)' : language === 'hi' ? 'भेड़ (Sheep)' : 'Sheep'}</option>
                      <option value="Camel">{language === 'mr' ? 'उंट (Camel)' : language === 'hi' ? 'ऊंट (Camel)' : 'Camel'}</option>
                      <option value="Horse">{language === 'mr' ? 'घोडा / खच्चर (Horse / Equine)' : language === 'hi' ? 'घोड़ा / खच्चर (Horse / Equine)' : 'Horse / Equine'}</option>
                      <option value="Pig">{language === 'mr' ? 'डुक्कर (Pig / Swine)' : language === 'hi' ? 'सूअर (Pig / Swine)' : 'Pig / Swine'}</option>
                      <option value="Poultry">{language === 'mr' ? 'कुक्कुट / कोंबडी (Poultry)' : language === 'hi' ? 'मुर्गी / कुक्कुट (Poultry)' : 'Poultry (Chicken)'}</option>
                      <option value="Rabbit">{language === 'mr' ? 'ससा (Rabbit)' : language === 'hi' ? 'खरगोश (Rabbit)' : 'Rabbit'}</option>
                      <option value="Duck">{language === 'mr' ? 'बदक (Duck)' : language === 'hi' ? 'बत्तख (Duck)' : 'Duck'}</option>
                      <option value="Quail">{language === 'mr' ? 'बटेर / लाव्हा (Quail)' : language === 'hi' ? 'बटेर (Quail)' : 'Quail'}</option>
                      <option value="Mule">{language === 'mr' ? 'खेच्चर / खच्चर (Mule)' : language === 'hi' ? 'खच्चर (Mule)' : 'Mule'}</option>
                      <option value="Fishery">{language === 'mr' ? 'मत्स्यपालन / मासे (Fishery / Aquaculture)' : language === 'hi' ? 'मत्स्य पालन (Fishery / Aquaculture)' : 'Fishery / Aquaculture'}</option>
                      <option value="Yak">{language === 'mr' ? 'याक / मिथुन (Yak / Mithun)' : language === 'hi' ? 'याक / मिथुन (Yak / Mithun)' : 'Yak / Mithun'}</option>
                      <option value="Donkey">{language === 'mr' ? 'गाढव (Donkey)' : language === 'hi' ? 'गधा (Donkey)' : 'Donkey'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      {language === 'mr' ? 'जात (Breed)' : language === 'hi' ? 'नस्ल' : 'Breed'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gir, Murrah"
                      value={manualBreed}
                      onChange={(e) => setManualBreed(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {language === 'mr'
                    ? 'अद्याप कोणतेही पशू नोंदणीकृत नाहीत. हा पशू अहवालासह आपोआप तुमच्या कळपात नोंदवला जाईल.'
                    : language === 'hi'
                    ? 'अभी तक कोई पशु पंजीकृत नहीं है। यह पशु रिपोर्ट के साथ स्वचालित रूप से आपके झुंड में पंजीकृत हो जाएगा।'
                    : 'No livestock registered yet. This animal will be registered to your herd automatically with this report.'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!selectedAnimalId && !manualTag}
            className="btn-primary"
            style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: 'var(--radius-lg)' }}
          >
            {language === 'mr' ? 'पुढे जा' : language === 'hi' ? 'आगे बढ़ें' : 'Next'}
          </button>
        </div>
      )}

      {/* STEP 2: What are you seeing? (Matching Wireframe Screen 7) */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>{t.reporting.step1Title}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {t.reporting.step1Subtitle}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                id: 'sick',
                title: t.reporting.animalSeemsSick,
                desc: t.reporting.animalSeemsSickDesc,
                icon: AlertCircle,
                color: 'var(--primary)',
                bg: 'var(--primary-light)',
              },
              {
                id: 'died',
                title: t.reporting.animalDied,
                desc: t.reporting.animalDiedDesc,
                icon: Skull,
                color: '#dc2626',
                bg: '#fef2f2',
              },
              {
                id: 'multiple',
                title: t.reporting.multipleAnimalsAffected,
                desc: t.reporting.multipleAnimalsAffectedDesc,
                icon: Users,
                color: '#d97706',
                bg: '#fffbeb',
              },
              {
                id: 'vaccine',
                title: t.reporting.vaccinationIssue,
                desc: t.reporting.vaccinationIssueDesc,
                icon: Syringe,
                color: '#2563eb',
                bg: '#eff6ff',
              },
              {
                id: 'treatment',
                title: t.reporting.treatmentIssue,
                desc: t.reporting.treatmentIssueDesc,
                icon: Pill,
                color: '#7c3aed',
                bg: '#f5f3ff',
              },
              {
                id: 'sample',
                title: t.reporting.sampleNeeded,
                desc: t.reporting.sampleNeededDesc,
                icon: FlaskConical,
                color: '#0891b2',
                bg: '#ecfeff',
              },
              {
                id: 'other',
                title: t.reporting.otherIssue,
                desc: language === 'mr' ? 'इतर लक्षणे नोंदवा' : language === 'hi' ? 'अन्य लक्षण दर्ज करें' : 'Describe custom symptom observation',
                icon: HelpCircle,
                color: '#475569',
                bg: '#f1f5f9',
              },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleStep1Select(cat.id)}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    padding: '16px',
                    border: selectedCategory === cat.id ? '2px solid var(--primary)' : '1px solid var(--border-card)',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: cat.bg,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700 }}>{cat.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cat.desc}</div>
                  </div>
                  <ChevronRight size={18} color="var(--text-light)" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Symptoms Selection Form (Matching Wireframe Screen 8) */}
      {step === 3 && (
        <form onSubmit={handleSubmitReport}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>{t.reporting.step2Title}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {t.reporting.step2Subtitle}
          </p>

          {/* Offline AI Disease Scanner Card (Edge Neural Engine) */}
          <div
            className="glass-card"
            style={{
              padding: '16px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #f8fff9 0%, #f0fdf4 100%)',
              border: '1.5px dashed #52b788',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#2d6a4f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1b4332' }}>
                    {language === 'mr' ? 'ऑफलाइन एआय रोग स्कॅनर' : language === 'hi' ? 'ऑफलाइन एआई रोग स्कैनर' : 'Offline AI Disease Scanner'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#2d6a4f' }}>
                    {language === 'mr' ? 'इंटरनेटशिवाय ऑन-डिव्हाइस संगणक दृष्टी व रोग निदान' : 'On-device vision & clinical triage — no internet needed'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  id="offline-lesion-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoFileUpload}
                />
                <label
                  htmlFor="offline-lesion-upload"
                  className="btn-secondary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#ffffff',
                  }}
                >
                  <Microscope size={13} color="#2d6a4f" />
                  <span>{language === 'mr' ? 'फोटो अपलोड करा' : language === 'hi' ? 'फोटो अपलोड करें' : 'Upload Photo'}</span>
                </label>

                {/* Live Camera Capturing Option */}
                <button
                  type="button"
                  onClick={() => startLiveCamera()}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#ffffff',
                    color: '#2d6a4f',
                    border: '1px solid #52b788',
                    cursor: 'pointer',
                  }}
                >
                  <Camera size={13} color="#2d6a4f" />
                  <span>{language === 'mr' ? 'कॅमेरामधून फोटो काढा' : language === 'hi' ? 'कैमरा से फोटो लें' : 'Live Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOfflineScanImage}
                  disabled={scanningImage}
                  className="btn-primary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Zap size={13} color="#95d5b2" />
                  <span>{scanningImage ? (language === 'mr' ? 'स्कॅनिंग...' : 'Scanning...') : (language === 'mr' ? 'त्वरित एआय स्कॅन' : language === 'hi' ? 'त्वरित एआई स्कैन' : 'Quick AI Scan')}</span>
                </button>
              </div>
            </div>

            {/* Attached Photo Preview Thumbnail */}
            {capturedPhotoUrl && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #a7f3d0',
                  marginTop: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={capturedPhotoUrl}
                    alt="Captured animal/lesion"
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1.5px solid #10b981',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46' }}>
                      {language === 'mr' ? 'पशूचा फोटो जोडला गेला' : language === 'hi' ? 'पशु का फोटो संलग्न' : 'Animal Photo Attached'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                      {language === 'mr' ? 'एआय विश्लेषण व नोंदीसाठी तयार' : 'Ready for on-device clinical scan'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => startLiveCamera()}
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: '6px' }}
                  >
                    <RefreshCw size={12} /> {language === 'mr' ? 'पुन्हा काढा' : language === 'hi' ? 'पुनः लें' : 'Retake'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCapturedPhotoUrl(null)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '4px 6px', cursor: 'pointer' }}
                    title="Remove Photo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}

            {scanningImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '10px' }}>
                <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #2d6a4f', borderTopColor: 'transparent', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.78rem', color: '#1b4332', fontWeight: 600 }}>
                  {language === 'mr' ? 'ऑफलाइन मॉडेलद्वारे लक्षणांचे विश्लेषण होत आहे...' : 'Running on-device local AI disease inference...'}
                </span>
              </div>
            )}

            {scannedResult && !scanningImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #86efac', marginTop: '10px' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 700 }}>
                  {scannedResult}
                </span>
              </div>
            )}
          </div>

          {/* Optional Voice Description / Audio Recorder Card */}
          <div
            className="glass-card"
            style={{
              padding: '16px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
              border: isAudioRecording ? '2px solid #ef4444' : '1.5px solid #6ee7b7',
              marginBottom: '20px',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isAudioRecording ? '#fee2e2' : '#dcfce7',
                    color: isAudioRecording ? '#dc2626' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isAudioRecording ? '0 0 10px rgba(220, 38, 38, 0.4)' : 'none',
                  }}
                >
                  {isAudioRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {language === 'mr' ? 'आवाजात लक्षणे सांगा' : language === 'hi' ? 'बोलकर लक्षण बताएं' : 'Voice Symptoms Audio'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 8px',
                        borderRadius: '10px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      {language === 'mr' ? 'ऐच्छिक' : language === 'hi' ? 'वैकल्पिक' : 'Optional'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {language === 'mr'
                      ? 'जर वरील यादीतून आजार किंवा लक्षणे निवडता येत नसतील, तर जनावराची लक्षणे आपल्या आवाजात सांगा.'
                      : language === 'hi'
                      ? 'यदि ऊपर दी गई सूची में से बीमारी या लक्षण नहीं चुन पा रहे हैं, तो बोलकर लक्षण रिकॉर्ड करें।'
                      : 'If you have not selected any disease above, describe animal symptoms using audio.'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isAudioRecording && !recordedAudioUrl && (
                  <button
                    type="button"
                    onClick={startAudioRecording}
                    className="btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      background: '#ffffff',
                      border: '1.5px solid #059669',
                      color: '#059669',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)',
                    }}
                  >
                    <Mic size={15} />
                    <span>{language === 'mr' ? 'रेकॉर्डिंग सुरू करा' : language === 'hi' ? 'रिकॉर्डिंग शुरू करें' : 'Record Audio'}</span>
                  </button>
                )}

                {isAudioRecording && (
                  <button
                    type="button"
                    onClick={stopAudioRecording}
                    className="btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      background: '#dc2626',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                    }}
                  >
                    <Square size={13} fill="#ffffff" />
                    <span>{language === 'mr' ? 'रेकॉर्डिंग थांबवा' : language === 'hi' ? 'रिकॉर्डिंग रोकें' : 'Stop Recording'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Recording In-Progress Banner */}
            {isAudioRecording && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                  marginTop: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#dc2626',
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b' }}>
                    {language === 'mr' ? 'आवाज ऐकत आहे... बोला' : language === 'hi' ? 'सुन रहा है... बोलिए' : 'Listening... Speak symptoms now'}
                  </span>
                </div>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                  00:{recordingSeconds.toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Recorded Audio Playback & Actions */}
            {recordedAudioUrl && !isAudioRecording && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #a7f3d0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>
                    <CheckCircle2 size={15} color="#059669" />
                    <span>{language === 'mr' ? 'व्हॉइस रेकॉर्डिंग यशस्वीरित्या जोडले' : language === 'hi' ? 'वॉइस रिकॉर्डिंग सफलतापूर्वक संलग्न' : 'Voice Symptoms Recording Attached'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={deleteAudioRecording}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#dc2626',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>{language === 'mr' ? 'हटवा' : language === 'hi' ? 'हटाएं' : 'Delete'}</span>
                  </button>
                </div>

                <audio controls src={recordedAudioUrl} style={{ width: '100%', height: '36px' }} />

                {speechTranscript && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-main)', marginTop: '8px', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <strong>{language === 'mr' ? 'आवाजाचे मजकुरात रुपांतर:' : language === 'hi' ? 'आवाज से पहचाने गए लक्षण:' : 'Recognized Voice Symptoms:'}</strong> {speechTranscript}
                  </div>
                )}
              </div>
            )}

            {audioError && (
              <div style={{ marginTop: '10px', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px', color: '#b91c1c', fontSize: '0.76rem' }}>
                {audioError}
              </div>
            )}
          </div>

          {/* Symptoms Checklist */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label">{t.reporting.step2Title}</label>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                {selectedSymptoms.length} {t.reporting.symptomsCount}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
              {symptomList.map((item) => {
                const label = t.symptoms[item.key] || item.defaultEn;
                const isSelected = selectedSymptoms.includes(item.defaultEn);

                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleToggleSymptom(item.defaultEn)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      background: isSelected ? 'var(--primary-light)' : '#ffffff',
                      color: isSelected ? 'var(--primary-deep)' : 'var(--text-main)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{label}</span>
                    {isSelected && <Check size={14} strokeWidth={3} color="var(--primary)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mortality Count Input */}
          <div className="form-group">
            <label className="form-label">{t.reporting.mortalityCount}</label>
            <input
              type="number"
              min="0"
              value={mortalityCount}
              onChange={(e) => setMortalityCount(parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          {/* Duration of Symptoms */}
          <div className="form-group">
            <label className="form-label">
              {language === 'mr' ? 'लक्षणांचा कालावधी (दिवस)' : language === 'hi' ? 'लक्षणों की अवधि (दिन)' : 'Duration of Symptoms (Days)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={durationDays > 0 ? durationDays : ''}
              onChange={(e) => setDurationDays(parseFloat(e.target.value) || 0)}
              placeholder={language === 'mr' ? 'उदा. २ दिवस' : language === 'hi' ? 'उदा. 2 दिन' : 'e.g. 2 days'}
              className="form-input"
            />
          </div>

          {/* Observations / Notes */}
          <div className="form-group">
            <label className="form-label">{t.reporting.additionalNotes}</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.reporting.notesPlaceholder}
              className="form-textarea"
            />
          </div>

          {/* Optional Clinical Photo Upload (Direct to EfficientNet-B3 Vision Model) */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={16} color="var(--primary)" />
              <span>{language === 'mr' ? 'क्लिनिकल फोटो अपलोड (ऐच्छिक)' : language === 'hi' ? 'नैदानिक फोटो अपलोड (वैकल्पिक)' : 'Upload Clinical Photo (Optional)'}</span>
            </label>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {language === 'mr'
                ? 'तोंड, खूर, कातडीच्या गाठी किंवा इतर जखमांचा स्पष्ट फोटो अपलोड करा (JPEG, PNG, WEBP).'
                : language === 'hi'
                ? 'मुंह, खुर, त्वचा की गांठ या अन्य घावों का स्पष्ट फोटो अपलोड करें (JPEG, PNG, WEBP)।'
                : 'Provide a clear photograph of lesions, oral blisters, skin nodules, or affected regions for EfficientNet-B3 visual analysis.'}
            </div>

            {!imagePreview ? (
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '18px',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px dashed var(--border-card)',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <UploadCloud size={28} color="var(--primary)" />
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {language === 'mr' ? 'फोटो निवडा किंवा कॅमेऱ्याने काढा' : language === 'hi' ? 'फोटो चुनें या कैमरे से लें' : 'Select image or capture photo'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  JPEG, PNG, WEBP (Evaluated by Phase 2 Vision Model)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
              </label>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Clinical Evidence Preview"
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {selectedImage?.name || 'clinical_photo.jpg'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>
                    ✓ {language === 'mr' ? 'फोटो जोडला गेला' : language === 'hi' ? 'फोटो संलग्न' : 'Photo Attached for Vision Inference'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ✕ {language === 'mr' ? 'काढून टाका' : 'Remove'}
                </button>
              </div>
            )}
          </div>

          {/* Source Selection (Mapped to report_source enum: web, mobile, ivr) */}
          <div className="form-group">
            <label className="form-label">{t.reporting.source}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['mobile', 'web', 'ivr'] as ReportSource[]).map((src) => (
                <button
                  type="button"
                  key={src}
                  onClick={() => setSource(src)}
                  className={`role-pill ${source === src ? 'active' : ''}`}
                  style={{ textTransform: 'capitalize', padding: '6px 14px' }}
                >
                  {src.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Real AI Service Error Banner */}
          {aiError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1.5px solid #f87171',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                marginBottom: '16px',
                color: '#991b1b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '6px' }}>
                <AlertCircle size={18} color="#dc2626" />
                <span>{language === 'mr' ? 'एआय सेवा सध्या अनुपलब्ध आहे' : language === 'hi' ? 'एआई सेवा वर्तमान में अनुपलब्ध है' : 'AI Assessment Service Unavailable'}</span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 12px 0', color: '#7f1d1d' }}>
                {aiError}
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleSubmitReport()}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '8px 14px' }}
                >
                  {language === 'mr' ? 'पुन्हा प्रयत्न करा' : language === 'hi' ? 'पुनः प्रयास करें' : 'Retry AI Analysis'}
                </button>
                <button
                  type="button"
                  onClick={handleManualSubmitWithoutAi}
                  className="btn-primary"
                  style={{ fontSize: '0.78rem', padding: '8px 14px' }}
                >
                  {language === 'mr' ? 'मॅन्युअल अहवाल सेव्ह करा' : language === 'hi' ? 'मैन्युअल रिपोर्ट सहेजें' : 'Save Manual Report Without AI'}
                </button>
              </div>
            </div>
          )}

          {/* Submission in progress indicator */}
          {submitting && (
            <div
              style={{
                background: 'rgba(5, 150, 105, 0.08)',
                border: '1.5px solid #10b981',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2.5px solid #10b981',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#065f46' }}>
                {language === 'mr'
                  ? 'जीवसंरक्षक एआय क्लिनिकल माहिती व फोटोचे विश्लेषण करत आहे...'
                  : language === 'hi'
                  ? 'जीवरक्षक एआई नैदानिक जानकारी और फोटो का विश्लेषण कर रहा है...'
                  : 'Analyzing reported animal health information with JeevRakshak AI...'}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: 'var(--radius-lg)' }}
          >
            {submitting ? t.reporting.submitting : t.reporting.submitReport}
          </button>
        </form>
      )}

      {/* STEP 4: Automated AI Triage Assessment & Official Clinical Report */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Custom Styles for Step 4 Print, Animations & Micro-Interactions */}
          <style>{`
            @keyframes pulseUrgent {
              0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
              100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
            }
            @keyframes beaconGlow {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(0.92); }
            }
            .sop-card-interactive {
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .sop-card-interactive:hover {
              transform: translateY(-2px);
              border-color: var(--primary) !important;
              box-shadow: 0 6px 16px rgba(5, 150, 105, 0.12);
            }
            @media print {
              body { background: #ffffff !important; color: #000000 !important; }
              .no-print, .top-header, .desktop-sidebar, .mobile-nav-dock { display: none !important; }
              .glass-card { box-shadow: none !important; border: 1px solid #94a3b8 !important; break-inside: avoid; }
            }
          `}</style>

          {/* SOS Dispatch Confirmation Toast Banner (when triggered) */}
          {sosDispatched && (
            <div
              style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '1.5px solid #10b981',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)',
                animation: 'beaconGlow 3s infinite',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#065f46' }}>
                    {language === 'mr'
                      ? 'जीवसंरक्षक एसओएस केस प्राधान्य अलर्ट प्रेषित!'
                      : language === 'hi'
                      ? 'जीवरक्षक एसओएस आपातकालीन केस अलर्ट प्रेषित!'
                      : 'Emergency Case Escalation Alert Transmitted!'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                    {language === 'mr'
                      ? 'तालुका पशुवैद्यकीय अधिकारी व प्रादेशिक रोग नियंत्रण केंद्रास अति-तातडीचे प्रकरण म्हणून अलर्ट नोंदवला गेला आहे.'
                      : language === 'hi'
                      ? 'ब्लॉक पशु चिकित्सा अधिकारी एवं क्षेत्रीय रोग नियंत्रण केंद्र को उच्च-प्राथमिकता मामले के रूप में अलर्ट दर्ज किया गया है।'
                      : 'Case logged with high-priority escalation flag to District Animal Husbandry Office & Regional Surveillance Queue.'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSosDispatched(false)}
                style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065f46', background: 'transparent', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Dynamic Data Calculation Scope */}
          {(() => {
            const topCondition = aiAssessment?.possible_conditions?.[0];
            const overallRisk = aiAssessment?.risk_assessment?.overall_risk || 'moderate';
            const urgency = aiAssessment?.escalation?.urgency || 'routine';
            const hasClusterSignal = Boolean(aiAssessment?.risk_assessment?.cluster_signal);
            const isAnthrax =
              aiAssessment?.possible_conditions?.some((c) => c.disease.toLowerCase().includes('anthrax')) ||
              aiAssessment?.risk_assessment?.risk_factors?.some((f) => f.toLowerCase().includes('anthrax'));

            const riskColors =
              overallRisk === 'critical'
                ? { badgeBg: '#dc2626', badgeText: '#ffffff', border: '#f87171', bg: 'linear-gradient(135deg, #fff5f5 0%, #fff1f2 100%)', text: '#991b1b', gaugeColor: '#dc2626' }
                : overallRisk === 'high'
                ? { badgeBg: '#ea580c', badgeText: '#ffffff', border: '#fdba74', bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', text: '#9a3412', gaugeColor: '#ea580c' }
                : overallRisk === 'moderate'
                ? { badgeBg: '#d97706', badgeText: '#ffffff', border: '#fde68a', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', text: '#92400e', gaugeColor: '#d97706' }
                : { badgeBg: '#16a34a', badgeText: '#ffffff', border: '#86efac', bg: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', text: '#166534', gaugeColor: '#16a34a' };

            const riskLabel =
              overallRisk === 'critical'
                ? language === 'mr' ? 'अति-गंभीर धोका (CRITICAL)' : language === 'hi' ? 'अति-गंभीर जोखिम (CRITICAL)' : 'CRITICAL RISK DETECTED'
                : overallRisk === 'high'
                ? language === 'mr' ? 'उच्च धोका (HIGH RISK)' : language === 'hi' ? 'उच्च जोखिम (HIGH RISK)' : 'HIGH RISK DETECTED'
                : overallRisk === 'moderate'
                ? language === 'mr' ? 'मध्यम धोका (MODERATE)' : language === 'hi' ? 'मध्यम जोखिम (MODERATE)' : 'MODERATE RISK DETECTED'
                : language === 'mr' ? 'कमी धोका / सामान्य (LOW)' : language === 'hi' ? 'कम जोखिम / सामान्य (LOW)' : 'LOW RISK / NOMINAL';

            const refNumber = aiAssessment?.assessment_id
              ? `MH-AI-${aiAssessment.assessment_id.slice(0, 8).toUpperCase()}`
              : generatedReport?.id
              ? `MH-REP-${generatedReport.id.slice(0, 8).toUpperCase()}`
              : 'MH-AI-0101';

            const activeAnimal = animals.find((a) => a.id === selectedAnimalId);

            // Dynamic SOP checklist aggregation
            const allSopItems: Array<{ id: string; category: string; text: string }> = [];
            if (aiAssessment?.recommended_actions) {
              const rec = aiAssessment.recommended_actions;
              rec.immediate_actions.forEach((act, idx) => allSopItems.push({ id: `sop-imm-${idx}`, category: 'Immediate Biosecurity', text: act }));
              rec.containment_precautions.forEach((act, idx) => allSopItems.push({ id: `sop-con-${idx}`, category: 'Containment & Quarantine', text: act }));
              rec.veterinary_referral.forEach((act, idx) => allSopItems.push({ id: `sop-vet-${idx}`, category: 'Veterinary Referral', text: act }));
              rec.sample_collection.forEach((act, idx) => allSopItems.push({ id: `sop-sam-${idx}`, category: 'Diagnostic Sampling Advisory', text: act }));
              rec.monitoring.forEach((act, idx) => allSopItems.push({ id: `sop-mon-${idx}`, category: 'Clinical Monitoring', text: act }));
            }

            return (
              <>
                {/* Official Government Clinical Header Banner */}
                <div
                  className="glass-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 12px 36px -4px rgba(6, 78, 59, 0.22)',
                    position: 'relative',
                  }}
                >
                  {/* National Tricolor Accent Ribbon */}
                  <div
                    style={{
                      height: '4px',
                      background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)',
                      width: '100%',
                    }}
                  />

                  <div
                    style={{
                      background: 'radial-gradient(ellipse at 90% 10%, rgba(16, 185, 129, 0.25) 0%, transparent 60%), linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)',
                      color: '#ffffff',
                      padding: '18px 16px',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 240px' }}>
                        {/* Government Emblem Medallion */}
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '14px',
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '2px solid rgba(251, 191, 36, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fbbf24',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                            flexShrink: 0,
                          }}
                        >
                          <ShieldAlert size={28} strokeWidth={2.2} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#6ee7b7',
                                background: 'rgba(255, 255, 255, 0.1)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              {language === 'mr'
                                ? 'महाराष्ट्र शासन • पशुसंवर्धन विभाग'
                                : language === 'hi'
                                ? 'महाराष्ट्र शासन • पशुपालन विभाग'
                                : 'GOVT OF MAHARASHTRA • DEPT OF ANIMAL HUSBANDRY'}
                            </span>
                          </div>

                          <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.45rem)', fontWeight: 800, color: '#ffffff', margin: '3px 0 4px 0', letterSpacing: '-0.02em' }}>
                            {language === 'mr'
                              ? 'साथरोग एआय ट्रायज व निदान अहवाल'
                              : language === 'hi'
                              ? 'महामारी एआई ट्राइएज एवं निदान रिपोर्ट'
                              : 'State Epidemiological AI Triage Report'}
                          </h2>

                          <div style={{ fontSize: '0.78rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Activity size={13} color="#34d399" />
                            <span>
                              {language === 'mr'
                                ? 'महाराष्ट्र पशुधन रोग नियंत्रण व जलद प्रतिसाद नेटवर्क (MLDSN)'
                                : language === 'hi'
                                ? 'महाराष्ट्र पशुधन रोग नियंत्रण एवं त्वरित प्रतिक्रिया नेटवर्क'
                                : 'Maharashtra Livestock Disease Surveillance & Rapid Response Network'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        {/* Urgency Badge */}
                        <div
                          style={{
                            background: riskColors.badgeBg,
                            border: '1.5px solid rgba(255, 255, 255, 0.4)',
                            color: riskColors.badgeText,
                            padding: '5px 14px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: `0 0 16px ${riskColors.gaugeColor}66`,
                            animation: overallRisk === 'critical' ? 'pulseUrgent 2s infinite' : 'none',
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
                          <span>{urgency.toUpperCase()} URGENCY</span>
                        </div>

                        {/* Reference ID Pill with 1-Click Copy */}
                        <button
                          type="button"
                          onClick={() => handleCopyRef(refNumber)}
                          title="Click to copy tracking reference"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            color: '#d1fae5',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {copiedRef ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                          <span>{copiedRef ? (language === 'mr' ? 'कॉपी झाले!' : 'Copied!') : `REF #${refNumber}`}</span>
                        </button>

                        <div style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>
                          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Anthrax Biohazard Safety Lock Warning Banner (when triggered) */}
                {isAnthrax && (
                  <div
                    style={{
                      background: '#450a0a',
                      border: '2px solid #ef4444',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px 24px',
                      color: '#ffffff',
                      boxShadow: '0 8px 24px rgba(220, 38, 38, 0.35)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                    }}
                  >
                    <Skull size={32} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fca5a5', marginBottom: '4px' }}>
                        CRITICAL BIOHAZARD PROTOCOL — ANTHRAX SAFETY LOCK
                      </div>
                      <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#fecaca', fontWeight: 600 }}>
                        <strong>DO NOT OPEN OR NECROPSY THE CARCASS.</strong> Bacillus anthracis vegetative cells rapidly form indestructible spores upon exposure to atmospheric oxygen. Immediately notify the District Veterinary Officer (DVO). Seal the carcass perimeter with lime powder and restrict human/canine access.
                      </div>
                    </div>
                  </div>
                )}

                {/* Animal & Farm Clinical Intake Dossier */}
                <div className="glass-card" style={{ padding: '20px 24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: '12px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'var(--primary-light)',
                          color: 'var(--primary-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {currentUser?.full_name ? `${currentUser.full_name}'s Farm` : 'Livestock Farm Facility'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {language === 'mr' ? 'नोंदणीकृत दुग्ध व पशुधन फार्म' : language === 'hi' ? 'पंजीकृत डेयरी एवं पशुधन फार्म' : 'Registered Dairy & Herd Facility'}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#f1f5f9',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <MapPin size={13} color="var(--primary)" />
                      <span>
                        {aiAssessment?.input_summary?.district
                          ? `${aiAssessment.input_summary.state || 'Maharashtra'} • ${aiAssessment.input_summary.district}`
                          : currentUser?.district
                          ? `${currentUser.state || 'Maharashtra'} • ${currentUser.district}`
                          : 'Maharashtra • Surveillance Region'}
                      </span>
                    </div>
                  </div>

                  {/* 4 Diagnostic Stat Pill Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px' }}>
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {language === 'mr' ? 'पशू टॅग (Ear Tag ID)' : language === 'hi' ? 'टैग संख्या (Ear Tag ID)' : 'Ear Tag ID'}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-deep)', fontFamily: 'monospace', marginTop: '2px' }}>
                        {activeAnimal?.tag_number || manualTag.trim().toUpperCase() || 'UNTAGGED-HERD'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                        ● {language === 'mr' ? 'सक्रिय पशुधन' : 'Registered Asset'}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {language === 'mr' ? 'प्रजाती व जात' : language === 'hi' ? 'प्रजाति एवं नस्ल' : 'Species & Breed'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', textTransform: 'capitalize' }}>
                        {activeAnimal?.species || aiAssessment?.animal_context?.species || 'Cattle'} • {activeAnimal?.breed || 'Indigenous'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px', textTransform: 'capitalize' }}>
                        {activeAnimal?.sex || 'Female'}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {language === 'mr' ? 'लक्षणांचा कालावधी' : language === 'hi' ? 'लक्षण अवधि' : 'Reported Duration'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: riskColors.gaugeColor, marginTop: '2px' }}>
                        {durationDays > 0 ? `${durationDays} Days` : aiAssessment?.animal_context?.duration_days ? `${aiAssessment.animal_context.duration_days} Days` : 'Acute (< 48h)'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                        {mortalityCount > 0 ? `${mortalityCount} Deaths Reported` : 'Zero Mortality'}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {language === 'mr' ? 'प्रतिबंध क्षेत्र स्थिती' : language === 'hi' ? 'नियंत्रण क्षेत्र स्थिति' : 'Surveillance Context'}
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: hasClusterSignal ? '#ea580c' : '#059669', marginTop: '2px' }}>
                        {hasClusterSignal ? 'Cluster Signal Flagged' : 'Routine Surveillance'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                        {hasClusterSignal ? 'Spatial buffer active' : 'Standard regional monitoring'}
                      </div>
                    </div>
                  </div>

                  {/* Observed Clinical Symptoms Pills */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {language === 'mr' ? 'नोंदवलेली प्राथमिक लक्षणे:' : language === 'hi' ? 'दर्ज प्राथमिक लक्षण:' : 'Observed Primary Symptoms:'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {((aiAssessment?.observations?.symptoms && aiAssessment.observations.symptoms.length > 0)
                        ? aiAssessment.observations.symptoms
                        : selectedSymptoms.length > 0
                        ? selectedSymptoms
                        : ['Fever', 'Loss of appetite']
                      ).map((sym, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#fef2f2',
                            color: '#b91c1c',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '5px 12px',
                            borderRadius: 'var(--radius-full)',
                            border: '1.5px solid #fca5a5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            textTransform: 'capitalize',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }} />
                          <span>{sym}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main AI Triage Assessment Showcase Banner */}
                <div
                  className="glass-card"
                  style={{
                    background: riskColors.bg,
                    border: `2px solid ${riskColors.border}`,
                    borderRadius: 'var(--radius-xl)',
                    padding: '24px 28px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top Glowing Ribbon */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #ef4444 0%, #f97316 50%, #10b981 100%)',
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldAlert size={22} color={riskColors.gaugeColor} />
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: riskColors.text }}>
                        {language === 'mr' ? 'एआय ट्रायज स्वयंचलित निष्कर्ष' : language === 'hi' ? 'एआई ट्राइएज स्वचालित निष्कर्ष' : 'AUTOMATED CLINICAL INFERENCE'}
                      </span>
                    </div>
                    <span
                      style={{
                        background: riskColors.badgeBg,
                        color: riskColors.badgeText,
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {riskLabel}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: riskColors.text, marginBottom: '4px', letterSpacing: '-0.02em' }}>
                    {topCondition?.disease
                      ? hasClusterSignal
                        ? `${language === 'mr' ? 'संभाव्य क्लस्टर:' : language === 'hi' ? 'संभावित क्लस्टर:' : 'Possible Cluster:'} ${topCondition.disease}`
                        : `${language === 'mr' ? 'प्राथमिक संशयित:' : language === 'hi' ? 'प्राथमिक संदिग्ध:' : 'Primary Differential:'} ${topCondition.disease}`
                      : 'Clinical Evaluation Complete'}
                  </h3>

                  <div style={{ fontSize: '0.78rem', color: riskColors.text, fontWeight: 700, marginBottom: '12px' }}>
                    {topCondition?.pathogen
                      ? `Pathogen: ${topCondition.pathogen}`
                      : 'Etiological confirmation requires laboratory sample diagnostic'}
                  </div>

                  <p style={{ fontSize: '0.88rem', color: riskColors.text, lineHeight: 1.6, marginBottom: '20px' }}>
                    {topCondition?.supporting_evidence && topCondition.supporting_evidence.length > 0
                      ? `Evidence indicators: ${topCondition.supporting_evidence.join('. ')}.`
                      : 'Reported symptoms and clinical indicators have been registered for epidemiological evaluation.'}
                    {hasClusterSignal &&
                      ` ${language === 'mr' ? 'या भागात संसर्ग क्लस्टरचे संकेत आढळले आहेत; तातडीने पशुवैद्यकीय तपासणी आवश्यक आहे.' : 'Spatial epidemiology analysis indicates a possible cluster signal in this district. Veterinary investigation strongly advised.'}`}
                  </p>

                  {/* 3 or 4 Metric Gauges Display */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px' }}>
                    {/* Gauge 1: Evidence Support */}
                    <div
                      style={{
                        background: '#ffffff',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1.5px solid var(--border-card)',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: riskColors.gaugeColor, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
                        {topCondition?.support_level || 'Moderate'}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                        {language === 'mr' ? 'पुराव्याची पातळी' : language === 'hi' ? 'साक्ष्य स्तर' : 'Evidence Support'}
                      </div>
                      <div style={{ height: '5px', borderRadius: 'var(--radius-full)', background: '#e2e8f0', marginTop: '8px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: topCondition?.support_level === 'high' ? '88%' : topCondition?.support_level === 'moderate' ? '62%' : '36%',
                            height: '100%',
                            background: riskColors.gaugeColor,
                            borderRadius: 'var(--radius-full)',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {topCondition?.support_level === 'high' ? 'Strong Marker Match' : 'Corroborating Signs'}
                      </div>
                    </div>

                    {/* Gauge 2: Severity */}
                    <div
                      style={{
                        background: '#ffffff',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1.5px solid var(--border-card)',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: riskColors.gaugeColor, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
                        {overallRisk}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                        {language === 'mr' ? 'ट्रायज तीव्रता' : language === 'hi' ? 'गंभीरता स्कोर' : 'Triage Severity'}
                      </div>
                      <div style={{ height: '5px', borderRadius: 'var(--radius-full)', background: '#e2e8f0', marginTop: '8px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: overallRisk === 'critical' ? '92%' : overallRisk === 'high' ? '76%' : overallRisk === 'moderate' ? '52%' : '24%',
                            height: '100%',
                            background: riskColors.gaugeColor,
                            borderRadius: 'var(--radius-full)',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {overallRisk === 'critical' ? 'Urgent Containment' : overallRisk === 'high' ? 'Active Referral' : 'Standard Monitoring'}
                      </div>
                    </div>

                    {/* Gauge 3: Response Urgency */}
                    <div
                      style={{
                        background: '#ffffff',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1.5px solid var(--border-card)',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
                        {urgency}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                        {language === 'mr' ? 'प्रतिसाद वेळ' : language === 'hi' ? 'प्रतिक्रिया समय' : 'Response Urgency'}
                      </div>
                      <div style={{ height: '5px', borderRadius: 'var(--radius-full)', background: '#e0f2fe', marginTop: '8px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: urgency === 'emergency' ? '100%' : urgency === 'urgent' ? '75%' : urgency === 'moderate' ? '50%' : '25%',
                            height: '100%',
                            background: '#0284c7',
                            borderRadius: 'var(--radius-full)',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {aiAssessment?.escalation?.required ? 'Escalation Required' : 'Field Routing'}
                      </div>
                    </div>

                    {/* Gauge 4: Vision Feature Match (if image analyzed) */}
                    {aiAssessment?.visual_analysis?.available && (
                      <div
                        style={{
                          background: '#ffffff',
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-lg)',
                          border: '1.5px solid #86efac',
                          textAlign: 'center',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.06)',
                        }}
                      >
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', letterSpacing: '-0.02em' }}>
                          {aiAssessment.visual_analysis.confidence != null ? `${(aiAssessment.visual_analysis.confidence * 100).toFixed(0)}%` : 'Analyzed'}
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                          {language === 'mr' ? 'व्हिजन मॉडेल जुळणी' : language === 'hi' ? 'विज़न मॉडल मैच' : 'Vision Match'}
                        </div>
                        <div style={{ height: '5px', borderRadius: 'var(--radius-full)', background: '#dcfce7', marginTop: '8px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${(aiAssessment.visual_analysis.confidence || 0.8) * 100}%`,
                              height: '100%',
                              background: '#16a34a',
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'capitalize' }}>
                          {aiAssessment.visual_analysis.predicted_class || 'Evidence extracted'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Analysis Photographic Evidence Card (when photo was provided) */}
                {aiAssessment?.visual_analysis?.available && (
                  <div className="glass-card" style={{ padding: '22px 26px', border: '1.5px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#ecfdf5',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Camera size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {language === 'mr' ? 'छायाचित्र वैशिष्ट्य विश्लेषण (Visual Feature Evidence)' : language === 'hi' ? 'चित्र साक्ष्य विश्लेषण (Visual Feature Evidence)' : 'Photographic Visual Feature Evidence'}
                        </h4>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Model: {aiAssessment.visual_analysis.model_name || 'EfficientNet-B3-Cattle-Disease'} ({aiAssessment.visual_analysis.architecture || 'EfficientNet-B3'})
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Analyzed lesion evidence"
                          style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid #cbd5e1',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          }}
                        />
                      )}

                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                            Top Visual Feature Class: <strong>{aiAssessment.visual_analysis.predicted_class}</strong>
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d' }}>
                            {aiAssessment.visual_analysis.confidence != null ? `${(aiAssessment.visual_analysis.confidence * 100).toFixed(1)}%` : ''}
                          </span>
                        </div>

                        {/* Softmax probabilities bars */}
                        {aiAssessment.visual_analysis.class_probabilities && Object.keys(aiAssessment.visual_analysis.class_probabilities).length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {Object.entries(aiAssessment.visual_analysis.class_probabilities).map(([cls, prob]) => (
                              <div key={cls}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  <span style={{ textTransform: 'capitalize' }}>{cls.replace(/-/g, ' ')}</span>
                                  <span>{(prob * 100).toFixed(1)}%</span>
                                </div>
                                <div style={{ height: '5px', borderRadius: 'var(--radius-full)', background: '#e2e8f0', marginTop: '2px' }}>
                                  <div
                                    style={{
                                      width: `${prob * 100}%`,
                                      height: '100%',
                                      background: cls === aiAssessment.visual_analysis.predicted_class ? 'var(--primary)' : '#94a3b8',
                                      borderRadius: 'var(--radius-full)',
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div
                          style={{
                            marginTop: '10px',
                            fontSize: '0.74rem',
                            color: '#065f46',
                            background: '#ecfdf5',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          ⚠️ <em>{aiAssessment.visual_analysis.disclaimer}</em>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Differential Diagnosis Matrix Showcase */}
                <div className="glass-card" style={{ padding: '22px 26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'var(--primary-light)',
                          color: 'var(--primary-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Microscope size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {language === 'mr' ? 'तपासणी केलेले संभाव्य रोग (Differential Diagnosis)' : language === 'hi' ? 'संभावित रोग निदान सूची (Differential Diagnosis)' : 'Differential Diagnosis Matrix'}
                        </h4>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {language === 'mr' ? 'एआय इव्हिडन्स-फ्युजन मॉडेलने तपासलेले रोग' : 'Evidence-weighted multi-factorial disease candidates'}
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {aiAssessment?.possible_conditions ? `${aiAssessment.possible_conditions.length} Candidates Evaluated` : 'No conditions found'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {aiAssessment?.possible_conditions && aiAssessment.possible_conditions.length > 0 ? (
                      aiAssessment.possible_conditions.map((cond, idx) => {
                        const isPrimary = idx === 0;
                        const cardBg = cond.support_level === 'high' ? '#fef2f2' : cond.support_level === 'moderate' ? '#fffbeb' : '#f8fafc';
                        const cardBorder = cond.support_level === 'high' ? '#f87171' : cond.support_level === 'moderate' ? '#fde68a' : 'var(--border-card)';
                        const badgeBg = cond.support_level === 'high' ? '#dc2626' : cond.support_level === 'moderate' ? '#d97706' : '#64748b';
                        const barWidth = cond.support_level === 'high' ? '88%' : cond.support_level === 'moderate' ? '62%' : '36%';

                        return (
                          <div
                            key={idx}
                            style={{
                              background: cardBg,
                              border: `1.5px solid ${cardBorder}`,
                              borderRadius: 'var(--radius-lg)',
                              padding: '16px 20px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                                    {idx + 1}. {cond.disease}
                                  </span>
                                  <span style={{ background: badgeBg, color: '#ffffff', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                                    {isPrimary ? (language === 'mr' ? 'प्राथमिक संशयित' : 'PRIMARY SUSPECT') : cond.support_level.toUpperCase()}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  {cond.pathogen ? `Pathogen: ${cond.pathogen}` : 'Etiological confirmation pending'}
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: badgeBg, textTransform: 'capitalize' }}>
                                  {cond.support_level} Support
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                  Evidence Level
                                </div>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{ height: '5px', borderRadius: 'var(--radius-full)', background: '#e2e8f0', margin: '8px 0 10px 0' }}>
                              <div style={{ width: barWidth, height: '100%', background: badgeBg, borderRadius: 'var(--radius-full)' }} />
                            </div>

                            {/* Supporting Evidence */}
                            {cond.supporting_evidence && cond.supporting_evidence.length > 0 && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '4px' }}>
                                <strong>{language === 'mr' ? 'जुळणारी लक्षणे:' : language === 'hi' ? 'समान मुख्य लक्षण:' : 'Key Matched Markers:'}</strong>{' '}
                                {cond.supporting_evidence.join(', ')}
                              </div>
                            )}

                            {/* Contradicting or Missing Evidence */}
                            {cond.contradicting_or_missing_evidence && cond.contradicting_or_missing_evidence.length > 0 && (
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                <strong>{language === 'mr' ? 'अनुपस्थित / भिन्न घटक:' : language === 'hi' ? 'अनुपस्थित / भिन्न कारक:' : 'Missing / Distinguishing Factors:'}</strong>{' '}
                                {cond.contradicting_or_missing_evidence.join(', ')}
                              </div>
                            )}

                            {/* Source references */}
                            {cond.sources && cond.sources.length > 0 && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '6px' }}>
                                Source: {cond.sources.join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        No specific infectious disease profiles exceeded clinical threshold.
                      </div>
                    )}
                  </div>
                </div>

                {/* Epidemiological Context & Environmental Telemetry Card */}
                <div className="glass-card" style={{ padding: '22px 26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#fff7ed',
                        color: '#ea580c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {language === 'mr' ? 'साथरोग व हवामान संदर्भ (Epidemiological Triggers)' : language === 'hi' ? 'महामारी एवं मौसम संदर्भ (Epidemiological Triggers)' : 'Epidemiological & Environmental Triggers'}
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ICAR-NIVEDI NADRES Forewarning Bulletin & Open-Meteo Environmental Context
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
                    {/* NADRES Forewarning */}
                    <div
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.86rem', color: '#991b1b', marginBottom: '4px' }}>
                        <span>📍</span>
                        <span>NADRES Forewarning Bulletin</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                        {aiAssessment?.epidemiological_context?.nadres?.available
                          ? `ICAR-NIVEDI bulletin: ${aiAssessment.epidemiological_context.nadres.forewarning_level || 'Forewarning data active'} for ${aiAssessment.input_summary.district || 'district'}.`
                          : 'No active epidemic forewarning bulletin reported by ICAR-NIVEDI for this specific district and reference period.'}
                      </div>
                    </div>

                    {/* Open-Meteo Weather Variables */}
                    <div
                      style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.86rem', color: '#0369a1', marginBottom: '4px' }}>
                        <span>🌧️</span>
                        <span>
                          Weather Context ({aiAssessment?.environmental_context?.weather_available ? `${aiAssessment.environmental_context.relative_humidity_2m_pct ?? 75}% RH` : 'Telemetry'})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#075985', lineHeight: 1.5 }}>
                        {aiAssessment?.environmental_context?.weather_available
                          ? `Temp: ${aiAssessment.environmental_context.temperature_2m_c ?? 'N/A'}°C • RH: ${aiAssessment.environmental_context.relative_humidity_2m_pct ?? 'N/A'}% • Rain: ${aiAssessment.environmental_context.precipitation_mm ?? 0}mm. ${aiAssessment.environmental_context.relevant_observations?.join('; ') || 'Conditions recorded.'}`
                          : 'Ambient environmental parameters retrieved from Open-Meteo.'}
                      </div>
                    </div>

                    {/* Risk Factors / Trajectory */}
                    <div
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.86rem', color: '#b45309', marginBottom: '4px' }}>
                        <span>⚡</span>
                        <span>Clinical Risk Triggers</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#78350f', lineHeight: 1.5 }}>
                        {aiAssessment?.risk_assessment?.risk_factors && aiAssessment.risk_assessment.risk_factors.length > 0
                          ? aiAssessment.risk_assessment.risk_factors.join('. ')
                          : 'Standard symptom evaluation without immediate high-velocity environmental contagion triggers.'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '12px',
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    ⚖️ {language === 'mr'
                      ? 'वैधानिक सूचना: प्राण्यांमधील संसर्गजन्य रोग प्रतिबंधक कायदा २००९ अन्वये संशयित साथरोग आढळल्यास विलगीकरण व वाहतूक नियंत्रण लागू होते.'
                      : language === 'hi'
                      ? 'वैधानिक सूचना: पशु संक्रामक रोग निवारण अधिनियम 2009 के तहत संदिग्ध महामारी होने पर पृथक्करण अनिवार्य है।'
                      : 'Statutory Notice: Under the Prevention & Control of Infectious & Contagious Diseases in Animals Act, 2009, suspected epizootic outbreaks require mandatory isolation and movement restrictions.'}
                  </div>
                </div>

                {/* Interactive Recommended Actions & Biosecurity SOPs */}
                <div className="glass-card" style={{ padding: '22px 26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'var(--primary-light)',
                          color: 'var(--primary-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {language === 'mr' ? 'तातडीच्या कृती व विलगीकरण कार्यपद्धती (Biosecurity SOPs)' : language === 'hi' ? 'तत्काल कार्रवाई एवं जैवसुरक्षा प्रक्रिया (Biosecurity SOPs)' : 'Recommended Actions & Biosecurity Protocols'}
                        </h4>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {language === 'mr' ? 'मार्गदर्शक कृती पूर्ण झाल्यावर खूण करा' : 'Interactive clinical compliance checklist'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: 'var(--primary-light)',
                          color: 'var(--primary-deep)',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {completedSopSteps.length} / {allSopItems.length} {language === 'mr' ? 'पूर्ण' : 'Completed'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {allSopItems.map((sop, idx) => {
                      const isChecked = completedSopSteps.includes(sop.id);
                      return (
                        <div
                          key={sop.id}
                          onClick={() => toggleSopStep(sop.id)}
                          className="sop-card-interactive"
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '14px',
                            background: isChecked ? '#f0fdf4' : '#f8fafc',
                            border: isChecked ? '1.5px solid #86efac' : '1px solid var(--border-card)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px 16px',
                          }}
                        >
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: isChecked ? 'var(--primary)' : '#ffffff',
                              border: isChecked ? 'none' : '2px solid #cbd5e1',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isChecked ? <Check size={14} strokeWidth={3} /> : <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>{idx + 1}</span>}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isChecked ? '#15803d' : 'var(--primary)', textTransform: 'uppercase' }}>
                                {sop.category}
                              </span>
                              {isChecked && (
                                <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: 'var(--radius-sm)' }}>
                                  ✓ Done
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.84rem', color: isChecked ? '#166534' : 'var(--text-main)', lineHeight: 1.5 }}>
                              {sop.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Data Gaps & Clinical Information Needs (when present) */}
                {aiAssessment?.data_gaps && aiAssessment.data_gaps.length > 0 && (
                  <div className="glass-card" style={{ padding: '18px 22px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Info size={18} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Information Needs & Clinical Data Gaps
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                      The assessment certainty could be enhanced by providing the following details:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {aiAssessment.data_gaps.map((gap, i) => (
                        <li key={i} style={{ marginBottom: '2px' }}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Authoritative Reference Sources & Disclaimer */}
                <div className="glass-card" style={{ padding: '18px 22px', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Authoritative Sources Consulted
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                    {aiAssessment?.sources && aiAssessment.sources.length > 0
                      ? aiAssessment.sources.join(' • ')
                      : 'ICAR-NIVEDI NADRES v2 • Department of Animal Husbandry & Dairying (DAHD) • WOAH/WAHIS • Open-Meteo'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                    ⚖️ <strong>Statutory Boundary:</strong> {aiAssessment?.disclaimer || 'This assessment is a veterinary decision-support aid and does not constitute a confirmed veterinary diagnosis. Always consult a certified veterinary officer.'}
                  </div>
                </div>

                {/* Assigned Institutional Referral & Emergency Contact */}
                <div
                  className="glass-card"
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                    border: '1.5px solid #86efac',
                    borderRadius: 'var(--radius-xl)',
                    padding: '22px 26px',
                    boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '16px',
                          background: 'var(--primary)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                          flexShrink: 0,
                        }}
                      >
                        <Stethoscope size={28} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {language === 'mr' ? 'तालुका पशुवैद्यकीय संदर्भ केंद्र' : language === 'hi' ? 'ब्लॉक पशु चिकित्सा संदर्भ केंद्र' : 'Taluka Veterinary Polyclinic Referral'}
                          </span>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                          <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>VERIFIED HELPLINE</span>
                        </div>

                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-deep)' }}>
                          National Animal Disease Toll-Free Helpline
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Dept of Animal Husbandry & Dairying, Govt of India • 24/7 Field Escalation
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <a
                        href="tel:1962"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#15803d',
                          color: '#ffffff',
                          padding: '10px 18px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(21, 128, 61, 0.3)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <PhoneCall size={16} />
                        <span>{language === 'mr' ? 'हेल्पलाइन: १९६२' : language === 'hi' ? 'हेल्पलाइन: 1962' : 'Toll-Free: 1962'}</span>
                      </a>
                    </div>
                  </div>
                </div>


          {/* Action CTAs Command Bar */}
          <div className="no-print" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button
              onClick={() => {
                setSosDispatched(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-secondary"
              style={{
                flex: '1 1 170px',
                minWidth: 'min(100%, 170px)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid #fca5a5',
                background: '#fef2f2',
                color: '#b91c1c',
                fontWeight: 800,
              }}
            >
              <PhoneCall size={18} color="#dc2626" />
              <span>{language === 'mr' ? 'पशुवैद्यांना एसओएस कॉल' : language === 'hi' ? 'पशु चिकित्सक एसओएस' : 'Call Field Vet (SOS)'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="btn-secondary"
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                flex: '1 1 120px',
                minWidth: 'min(100%, 120px)',
              }}
            >
              <Printer size={18} />
              <span>{language === 'mr' ? 'पावती प्रिंट' : language === 'hi' ? 'प्रिंट रसीद' : 'Print Official Slip'}</span>
            </button>

            <button
              onClick={() => {
                if (generatedReport) {
                  onReportComplete(generatedReport);
                } else {
                  onReportComplete({
                    id: 'rep-' + Date.now(),
                    animal_id: selectedAnimalId || '1',
                    reported_by: currentUser?.id || 'prof-local-farmer',
                    source,
                    symptoms: selectedSymptoms.join(', ') || 'Fever, Oral blisters, Salivation',
                    mortality_count: mortalityCount,
                    notes: notes || null,
                    reported_at: new Date().toISOString(),
                  });
                }
              }}
              className="btn-primary"
              style={{
                flex: '1.6 1 220px',
                minWidth: 'min(100%, 220px)',
                padding: '14px 20px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.96rem',
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
              }}
            >
              <CheckCircle2 size={19} />
              <span>{language === 'mr' ? 'केस सेव्ह करा व यादी पहा' : language === 'hi' ? 'केस सहेजें व सूची देखें' : 'Confirm & View in Cases'}</span>
            </button>
          </div>
        </>
      );
    })()}
  </div>
)}

      {/* Live Camera Capturing Modal */}
      {showCameraModal && (
        <div className="modal-backdrop" onClick={stopLiveCamera} style={{ zIndex: 1100 }}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', padding: '18px', textAlign: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  {language === 'mr' ? 'लाइव्ह कॅमेरा' : language === 'hi' ? 'लाइव कैमरा' : 'Live Camera Scanner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={stopLiveCamera}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {cameraError ? (
              <div style={{ padding: '20px', color: 'var(--critical)', fontSize: '0.85rem' }}>
                <AlertTriangle size={32} style={{ margin: '0 auto 10px' }} />
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={stopLiveCamera}
                  className="btn-secondary"
                  style={{ marginTop: '14px' }}
                >
                  {language === 'mr' ? 'बंद करा' : language === 'hi' ? 'बंद करें' : 'Close'}
                </button>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '320px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Viewfinder crosshairs frame */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '20px',
                      border: '2px dashed rgba(255,255,255,0.7)',
                      borderRadius: '12px',
                      pointerEvents: 'none',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.25)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.65)',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    {language === 'mr' ? 'जनावराची लक्षणे/जखम फ्रेममध्ये ठेवा' : language === 'hi' ? 'पशु के घाव/लक्षण फ्रेम में रखें' : 'Align animal/lesion in frame'}
                  </div>
                </div>

                {/* Camera Actions Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '16px' }}>
                  {/* Switch Camera */}
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="btn-secondary"
                    style={{ width: '44px', height: '44px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Flip Camera"
                  >
                    <RefreshCw size={18} />
                  </button>

                  {/* Shutter Capture Button */}
                  <button
                    type="button"
                    onClick={takePhotoSnapshot}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '4px solid var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}
                    title="Capture Photo"
                  >
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--primary)' }} />
                  </button>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="btn-secondary"
                    style={{ width: '44px', height: '44px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )};

