'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { UserRole } from '@/types/database';
import { Header } from '@/components/Header';
import { Navigation, ActiveTab } from '@/components/Navigation';
import { FarmerDashboard } from '@/components/FarmerDashboard';
import { HerdHub } from '@/components/HerdHub';
import { ReportFlow } from '@/components/ReportFlow';
import { FieldHealthCases } from '@/components/FieldHealthCases';
import { DistrictSurveillance } from '@/components/DistrictSurveillance';
import { AdvisoriesAlerts } from '@/components/AdvisoriesAlerts';
import { AnimalDetailModal } from '@/components/AnimalDetailModal';
import { LandingAndOnboarding } from '@/components/LandingAndOnboarding';
import { DatabaseStatusBanner } from '@/components/DatabaseStatusBanner';

export default function Home() {
  const { t } = useLanguage();
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Initialize role and onboarding state from dataService
  useEffect(() => {
    setMounted(true);
    const role = dataService.getCurrentRole();
    if (role) setCurrentRole(role);
    const done = dataService.hasCompletedOnboarding();
    setIsOnboarded(done);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    dataService.setCurrentRole(newRole);

    // Contextual tab switch on role change for best user experience
    if (newRole === 'farmer' && activeTab === 'surveillance') {
      setActiveTab('home');
    } else if (newRole === 'field_worker' && (activeTab === 'home' || activeTab === 'surveillance')) {
      setActiveTab('cases');
    } else if (newRole === 'veterinarian' && activeTab === 'home') {
      setActiveTab('cases');
    } else if (newRole === 'government' && (activeTab === 'home' || activeTab === 'herd')) {
      setActiveTab('surveillance');
    }
  };

  const handleSignOut = () => {
    dataService.signOut();
    setIsOnboarded(false);
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

  // If not yet onboarded or signed out, render Landing & Onboarding with status banner
  if (!isOnboarded) {
    return (
      <>
        <DatabaseStatusBanner />
        <LandingAndOnboarding
          onComplete={(role) => {
            handleRoleChange(role);
            setIsOnboarded(true);
          }}
        />
      </>
    );
  }

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
        <DatabaseStatusBanner />
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onOpenNotifications={() => setActiveTab('alerts')}
          onSignOut={handleSignOut}
        />

        <main className="page-container">
          {/* 1. Farmer Home Dashboard */}
          {activeTab === 'home' && (
            <FarmerDashboard
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
              onOpenReport={() => setActiveTab('report')}
              onOpenAdvisory={() => setActiveTab('alerts')}
              onOpenCases={() => setActiveTab('cases')}
            />
          )}

          {/* 2. Herd Management Hub */}
          {activeTab === 'herd' && (
            <HerdHub
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
              onOpenReport={() => setActiveTab('report')}
            />
          )}

          {/* 3. 3-Step Triage Report Flow */}
          {activeTab === 'report' && (
            <ReportFlow
              onReportComplete={() => {
                setActiveTab('cases');
              }}
              onCancel={() => setActiveTab('home')}
            />
          )}

          {/* 4. Field Health & Clinical Cases */}
          {activeTab === 'cases' && (
            <FieldHealthCases
              onSelectAnimal={(id) => setSelectedAnimalId(id)}
            />
          )}

          {/* 5. District Surveillance & Outbreak Response */}
          {activeTab === 'surveillance' && (
            <DistrictSurveillance
              onSelectCase={() => setActiveTab('cases')}
              onOpenReport={() => setActiveTab('report')}
            />
          )}

          {/* 6. Alerts & Advisories Center */}
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
