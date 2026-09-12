'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { UserRole } from '@/types/database';
import { Header } from '@/components/Header';
import { Navigation, ActiveTab } from '@/components/Navigation';
import { FarmerDashboard } from '@/components/FarmerDashboard';
import { VeterinarianDashboard } from '@/components/VeterinarianDashboard';
import { HerdHub } from '@/components/HerdHub';
import { ReportFlow } from '@/components/ReportFlow';
import { FieldHealthCases } from '@/components/FieldHealthCases';
import { DistrictSurveillance } from '@/components/DistrictSurveillance';
import { AdvisoriesAlerts } from '@/components/AdvisoriesAlerts';
import { AnimalDetailModal } from '@/components/AnimalDetailModal';
import { LandingAndOnboarding } from '@/components/LandingAndOnboarding';
import { FarmerHerdSetup } from '@/components/FarmerHerdSetup';
import { VetHospitalSetup } from '@/components/VetHospitalSetup';
import { VetDashboard } from '@/components/VetDashboard';

export default function Home() {
  const { t } = useLanguage();
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [herdSetupDone, setHerdSetupDone] = useState<boolean>(false);
  const [vetHospitalSetupDone, setVetHospitalSetupDone] = useState<boolean>(false);
  const [isEditingHospital, setIsEditingHospital] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

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
    setHerdSetupDone(dataService.hasCompletedHerdSetup());
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
      setHerdSetupDone(dataService.hasCompletedHerdSetup());
    }
  };

  const handleSignOut = () => {
    dataService.signOut();
    setIsOnboarded(false);
    setHerdSetupDone(false);
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

  // STEP 2: Farmer Herd Setup Page (Post-login onboarding - Skippable)
  if (currentRole === 'farmer' && !herdSetupDone) {
    return (
      <FarmerHerdSetup
        onComplete={() => {
          setHerdSetupDone(true);
          setActiveTab('home');
        }}
        onSkip={() => {
          setHerdSetupDone(true);
          setActiveTab('home');
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
        onSelectTab={setActiveTab}
        currentRole={currentRole}
      />

      {/* Main App Content View */}
      <div className="app-main">
        <Header
          currentRole={currentRole}
          onOpenNotifications={() => setActiveTab('alerts')}
          onSignOut={handleSignOut}
        />

        <main className="page-container">
          {/* ======================================================== */}
          {/* A. VETERINARIAN DEDICATED INTERFACE                       */}
          {/* ======================================================== */}
          {currentRole === 'veterinarian' && (activeTab === 'vet_desk' || activeTab === 'home') && (
            <VetDashboard
              onOpenCases={() => setActiveTab('cases')}
              onOpenReport={() => setActiveTab('report')}
              onOpenAdvisories={() => setActiveTab('alerts')}
              onEditHospitalSetup={() => setIsEditingHospital(true)}
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
            />
          )}

          {/* ======================================================== */}
          {/* B. GOVERNMENT OFFICIAL DEDICATED SURVEILLANCE INTERFACE   */}
          {/* ======================================================== */}
          {currentRole === 'government' && activeTab === 'surveillance' && (
            <DistrictSurveillance
              onSelectCase={() => setActiveTab('cases')}
              onOpenReport={() => setActiveTab('report')}
            />
          )}

          {/* ======================================================== */}
          {/* C. FARMER DEDICATED HOME DASHBOARD                       */}
          {/* ======================================================== */}
          {currentRole === 'farmer' && activeTab === 'home' && (
            <FarmerDashboard
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
              onOpenReport={() => setActiveTab('report')}
              onOpenAdvisory={() => setActiveTab('alerts')}
              onOpenCases={() => setActiveTab('cases')}
            />
          )}

          {/* Herd Management Hub (Farmer) */}
          {activeTab === 'herd' && (
            <HerdHub
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
              onOpenReport={() => setActiveTab('report')}
            />
          )}

          {/* 3-Step Triage Report Flow */}
          {activeTab === 'report' && (
            <ReportFlow
              onReportComplete={() => {
                setActiveTab('cases');
              }}
              onCancel={() => {
                if (currentRole === 'veterinarian') setActiveTab('vet_desk');
                else if (currentRole === 'government') setActiveTab('surveillance');
                else setActiveTab('home');
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
              onSelectCase={() => setActiveTab('cases')}
              onOpenReport={() => setActiveTab('report')}
            />
          )}

          {/* Alerts & Advisories Center */}
          {activeTab === 'alerts' && (
            <AdvisoriesAlerts
              onOpenReport={() => setActiveTab('report')}
              onOpenSurveillance={() => setActiveTab('surveillance')}
            />
          )}
        </main>
      </div>

      {/* Global Animal Detail Modal */}
      {selectedAnimalId && (
        <AnimalDetailModal
          animalId={selectedAnimalId}
          onClose={() => setSelectedAnimalId(null)}
          onReportAnimal={(animId) => {
            setSelectedAnimalId(null);
            setActiveTab('report');
          }}
        />
      )}
    </div>
  );
}
