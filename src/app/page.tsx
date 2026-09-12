'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { UserRole } from '@/types/database';
import { Header } from '@/components/Header';
import { Navigation, ActiveTab, GovCleanModule } from '@/components/Navigation';
import { FarmerDashboard } from '@/components/FarmerDashboard';
import { VeterinarianDashboard } from '@/components/VeterinarianDashboard';
import { HerdHub } from '@/components/HerdHub';
import { ReportFlow } from '@/components/ReportFlow';
import { FieldHealthCases } from '@/components/FieldHealthCases';
import { DistrictSurveillance } from '@/components/DistrictSurveillance';
import { AdvisoriesAlerts } from '@/components/AdvisoriesAlerts';
import { AnimalDetailModal } from '@/components/AnimalDetailModal';
import { LandingAndOnboarding } from '@/components/LandingAndOnboarding';
import { VetHospitalSetup } from '@/components/VetHospitalSetup';
import { VetDashboard } from '@/components/VetDashboard';
import { GovernmentOfficialDashboard } from '@/components/GovernmentOfficialDashboard';
import { FarmerPrescriptions } from '@/components/FarmerPrescriptions';
import { X, Plus } from 'lucide-react';

export default function Home() {
  const { t, language } = useLanguage();
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [tabHistory, setTabHistory] = useState<ActiveTab[]>([]);
  const [govModule, setGovModule] = useState<GovCleanModule>('dashboard');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [vetHospitalSetupDone, setVetHospitalSetupDone] = useState<boolean>(false);
  const [isEditingHospital, setIsEditingHospital] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const handleTabChange = (newTab: ActiveTab) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, activeTab]);
      setActiveTab(newTab);
    }
  };

  const handleBack = () => {
    // 1. Close open modals first (parent is the current page)
    if (showGlobalRegisterModal) {
      setShowGlobalRegisterModal(false);
      return;
    }
    if (selectedAnimalId) {
      setSelectedAnimalId(null);
      return;
    }
    if (isEditingHospital) {
      setIsEditingHospital(false);
      return;
    }

    const defaultRootTab: ActiveTab =
      currentRole === 'veterinarian' ? 'vet_desk' : currentRole === 'government' ? 'surveillance' : 'home';

    // 2. If on the root dashboard page, move directly to the landing page of our website
    if (activeTab === defaultRootTab) {
      setIsOnboarded(false);
      return;
    }

    // 3. Navigate to immediate previous page in history
    if (tabHistory.length > 0) {
      const prev = tabHistory[tabHistory.length - 1];
      setTabHistory((history) => history.slice(0, -1));
      setActiveTab(prev);
      return;
    }

    // 4. If government sub-module is active, reset to main government dashboard
    if (currentRole === 'government' && activeTab === 'surveillance' && govModule !== 'dashboard') {
      setGovModule('dashboard');
      return;
    }

    // 5. If on another tab with empty history, move to root dashboard or landing page
    if (activeTab !== defaultRootTab) {
      setActiveTab(defaultRootTab);
      return;
    }

    // 6. Otherwise return to the landing page
    setIsOnboarded(false);
  };

  // Global Register Livestock Animal Modal State
  const [showGlobalRegisterModal, setShowGlobalRegisterModal] = useState<boolean>(false);
  const [regTagNumber, setRegTagNumber] = useState('');
  const [regSpecies, setRegSpecies] = useState('Cattle');
  const [regBreed, setRegBreed] = useState('Gir');
  const [regSex, setRegSex] = useState<'female' | 'male'>('female');
  const [regDob, setRegDob] = useState('2023-01-01');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleRegisterAnimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regTagNumber.trim()) return;
    setRegSubmitting(true);
    try {
      const currentUser = dataService.getCurrentUser();
      const userHerds = await dataService.getHerds();
      let targetHerdId = userHerds[0]?.id;
      if (!targetHerdId && currentUser) {
        const newHerd = await dataService.createHerd({
          name: currentUser.full_name ? `${currentUser.full_name}'s Farm` : 'My Livestock Farm',
          owner_profile_id: currentUser.id,
          location_id: currentUser.location_id || '1',
        });
        targetHerdId = newHerd.id;
      }
      await dataService.createAnimal({
        herd_id: targetHerdId || (currentUser ? `herd-${currentUser.id}` : 'herd-default'),
        tag_number: regTagNumber.trim().toUpperCase(),
        species: regSpecies,
        breed: regBreed,
        sex: regSex,
        date_of_birth: regDob,
      });
      setShowGlobalRegisterModal(false);
      setRegTagNumber('');
      setActiveTab('herd');
    } catch (err) {
      console.error('Failed to register animal:', err);
    } finally {
      setRegSubmitting(false);
    }
  };

  // Initialize state from dataService on client mount
  useEffect(() => {
    setMounted(true);
    const role = dataService.getCurrentRole();
    if (role) {
      setCurrentRole(role);
      if (role === 'veterinarian') {
        setActiveTab('vet_desk');
      } else if (role === 'government') {
        setActiveTab('surveillance');
      } else {
        setActiveTab('home');
      }
    }
    setIsOnboarded(dataService.hasCompletedOnboarding());
    setVetHospitalSetupDone(dataService.hasCompletedVetHospitalSetup());
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    dataService.setCurrentRole(newRole);

    if (newRole === 'veterinarian') {
      setActiveTab('vet_desk');
      setVetHospitalSetupDone(dataService.hasCompletedVetHospitalSetup());
    } else if (newRole === 'government') {
      setActiveTab('surveillance');
    } else {
      setActiveTab('home');
    }
  };

  const handleSignOut = () => {
    dataService.signOut();
    setIsOnboarded(false);
    setVetHospitalSetupDone(false);
    setIsEditingHospital(false);
  };

  // Prevent flash before hydration
  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: '36px', height: '36px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>JeevRakshak AI...</p>
        </div>
      </div>
    );
  }

  // STEP 1: If not yet onboarded or signed out, render Landing & Onboarding
  if (!isOnboarded) {
    return (
      <LandingAndOnboarding
        onComplete={(role) => {
          handleRoleChange(role);
          setIsOnboarded(true);
        }}
      />
    );
  }

  // STEP 3: Veterinarian Hospital Setup Page (Post-login onboarding with exact location)
  if (currentRole === 'veterinarian' && (!vetHospitalSetupDone || isEditingHospital)) {
    return (
      <VetHospitalSetup
        onComplete={() => {
          setVetHospitalSetupDone(true);
          setIsEditingHospital(false);
          setActiveTab('vet_desk');
        }}
        onSkip={() => {
          setVetHospitalSetupDone(true);
          setIsEditingHospital(false);
          setActiveTab('vet_desk');
        }}
      />
    );
  }

  // STEP 4: Render Role-Dedicated Workspace
  return (
    <div className="app-shell">
      {/* Desktop Navigation Sidebar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        currentRole={currentRole}
        govModule={govModule}
        onSelectGovModule={setGovModule}
      />

      {/* Main App Content View */}
      <div className="app-main">
        <Header
          currentRole={currentRole}
          onOpenNotifications={() => handleTabChange('alerts')}
          onRegisterAnimal={() => setShowGlobalRegisterModal(true)}
          onBack={handleBack}
          onSignOut={handleSignOut}
        />

        <main className="page-container">
          {/* ======================================================== */}
          {/* A. VETERINARIAN DEDICATED INTERFACE                       */}
          {/* ======================================================== */}
          {currentRole === 'veterinarian' && (activeTab === 'vet_desk' || activeTab === 'home') && (
            <VetDashboard
              onOpenCases={() => handleTabChange('cases')}
              onOpenReport={() => handleTabChange('report')}
              onOpenAdvisories={() => handleTabChange('alerts')}
              onEditHospitalSetup={() => setIsEditingHospital(true)}
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
            />
          )}

          {/* ======================================================== */}
          {/* B. GOVERNMENT OFFICIAL DEDICATED SURVEILLANCE INTERFACE   */}
          {/* ======================================================== */}
          {currentRole === 'government' && (activeTab === 'surveillance' || activeTab === 'home') && (
            <GovernmentOfficialDashboard
              activeModule={govModule}
              onSelectModule={setGovModule}
              onSelectCase={() => handleTabChange('cases')}
              onOpenReport={() => handleTabChange('report')}
            />
          )}

          {/* ======================================================== */}
          {/* C. FARMER DEDICATED HOME DASHBOARD                       */}
          {/* ======================================================== */}
          {currentRole === 'farmer' && activeTab === 'home' && (
            <FarmerDashboard
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
              onOpenReport={() => handleTabChange('report')}
              onOpenAdvisory={() => handleTabChange('alerts')}
              onOpenCases={() => handleTabChange('cases')}
              onOpenPrescriptions={() => handleTabChange('prescriptions')}
            />
          )}

          {/* Farmer Doctor Prescriptions & Vet Care Plans Hub */}
          {activeTab === 'prescriptions' && (
            <FarmerPrescriptions
              onOpenReport={() => handleTabChange('report')}
            />
          )}

          {/* Herd Management Hub (Farmer) */}
          {activeTab === 'herd' && (
            <HerdHub
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
              onOpenReport={() => handleTabChange('report')}
            />
          )}

          {/* 3-Step Triage Report Flow */}
          {activeTab === 'report' && (
            <ReportFlow
              onReportComplete={() => {
                handleTabChange('cases');
              }}
              onCancel={() => {
                handleBack();
              }}
            />
          )}

          {/* Field Health & Clinical Cases */}
          {activeTab === 'cases' && (
            <FieldHealthCases
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
            />
          )}

          {/* District Surveillance (when navigated to from tabs) */}
          {activeTab === 'surveillance' && currentRole !== 'government' && (
            <DistrictSurveillance
              onSelectCase={() => handleTabChange('cases')}
              onOpenReport={() => handleTabChange('report')}
            />
          )}

          {/* Alerts & Advisories Center */}
          {activeTab === 'alerts' && (
            <AdvisoriesAlerts
              onOpenReport={() => handleTabChange('report')}
              onOpenSurveillance={() => handleTabChange('surveillance')}
            />
          )}
        </main>
      </div>

      {/* Global Register Animal Modal (Triggerable from Sticky Header & Hubs) */}
      {showGlobalRegisterModal && (
        <div className="modal-backdrop" onClick={() => setShowGlobalRegisterModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {language === 'mr' ? 'नवीन पशू नोंदणी' : language === 'hi' ? 'नया पशु पंजीकृत करें' : 'Register New Livestock Animal'}
                </h3>
              </div>
              <button
                onClick={() => setShowGlobalRegisterModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterAnimalSubmit}>
              <div className="form-group">
                <label className="form-label">
                  {language === 'mr' ? 'कान टॅग क्रमांक (Ear Tag Number)' : language === 'hi' ? 'कान टैग संख्या' : 'Ear Tag Number *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-PUN-0042"
                  value={regTagNumber}
                  onChange={(e) => setRegTagNumber(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {language === 'mr' ? 'पशू प्रजाती (Species)' : language === 'hi' ? 'प्रजाति' : 'Livestock Species *'}
                </label>
                <select
                  value={regSpecies}
                  onChange={(e) => setRegSpecies(e.target.value)}
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

              <div className="form-group">
                <label className="form-label">
                  {language === 'mr' ? 'जात (Breed)' : language === 'hi' ? 'नस्ल' : 'Breed'}
                </label>
                <input
                  type="text"
                  required
                  value={regBreed}
                  onChange={(e) => setRegBreed(e.target.value)}
                  placeholder="e.g. Gir, Murrah, Osmanabadi, Broiler"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    {language === 'mr' ? 'लिंग (Sex)' : language === 'hi' ? 'लिंग' : 'Sex'}
                  </label>
                  <select
                    value={regSex}
                    onChange={(e) => setRegSex(e.target.value as 'female' | 'male')}
                    className="form-select"
                  >
                    <option value="female">{language === 'mr' ? 'मादी (Female)' : language === 'hi' ? 'मादा (Female)' : 'Female'}</option>
                    <option value="male">{language === 'mr' ? 'नर (Male)' : language === 'hi' ? 'नर (Male)' : 'Male'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {language === 'mr' ? 'जन्म तारीख' : language === 'hi' ? 'जन्म तिथि' : 'Approx Birth'}
                  </label>
                  <input
                    type="date"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowGlobalRegisterModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  {language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="btn-primary"
                  style={{ flex: 1.5 }}
                >
                  {regSubmitting
                    ? (language === 'mr' ? 'नोंदणी होत आहे...' : 'Registering...')
                    : (language === 'mr' ? 'पशू जतन करा' : language === 'hi' ? 'पशु सुरक्षित करें' : 'Save Animal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Animal Detail Modal */}
      {selectedAnimalId && (
        <AnimalDetailModal
          animalId={selectedAnimalId}
          onClose={() => setSelectedAnimalId(null)}
          onReportAnimal={(animId) => {
            setSelectedAnimalId(null);
            handleTabChange('report');
          }}
        />
      )}

      {/* Sticky "Add Sick Animal" Floating Button throughout whole document */}
      {currentRole === 'farmer' && activeTab !== 'report' && (
        <button
          type="button"
          onClick={() => handleTabChange('report')}
          className="sticky-sick-animal-fab"
          title={language === 'mr' ? 'आजारी पशू नोंदवा' : language === 'hi' ? 'बीमार पशु जोड़ें' : 'Add Sick Animal'}
        >
          <Plus size={18} strokeWidth={2.6} />
          <span>
            {language === 'mr' ? 'आजारी पशू नोंदवा' : language === 'hi' ? 'बीमार पशु जोड़ें' : 'Add Sick Animal'}
          </span>
        </button>
      )}
    </div>
  );
}
