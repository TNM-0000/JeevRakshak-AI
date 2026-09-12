'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { AnimalWithDetails, Herd, HerdHealthEvent } from '@/types/database';
import {
  Layers,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  X,
  AlertCircle,
  Calendar,
  Users,
} from 'lucide-react';

interface HerdHubProps {
  onSelectAnimal: (animalId: string) => void;
  onOpenReport: () => void;
}

export const HerdHub: React.FC<HerdHubProps> = ({ onSelectAnimal, onOpenReport }) => {
  const { t } = useLanguage();
  const [animals, setAnimals] = useState<AnimalWithDetails[]>([]);
  const [herds, setHerds] = useState<Herd[]>([]);
  const [herdEvents, setHerdEvents] = useState<HerdHealthEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'treatment' | 'affected' | 'critical'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Animal modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [tagNumber, setTagNumber] = useState('');
  const [species, setSpecies] = useState('Cattle');
  const [breed, setBreed] = useState('Gir');
  const [sex, setSex] = useState<'female' | 'male'>('female');
  const [dob, setDob] = useState('2023-01-01');

  const loadData = () => {
    dataService.getAnimals().then(setAnimals);
    dataService.getHerds().then(setHerds);
    dataService.getHerdHealthEvents().then(setHerdEvents);
  };

  useEffect(() => {
    loadData();
  }, []);

  const healthyCount = animals.filter((a) => a.currentStatus === 'healthy').length;
  const treatmentCount = animals.filter((a) => a.currentStatus === 'treatment').length;
  const affectedCount = animals.filter((a) => a.currentStatus === 'affected').length;
  const criticalCount = animals.filter((a) => a.currentStatus === 'critical').length;
  const totalCount = animals.length || 1;

  const filteredAnimals = animals.filter((a) => {
    if (filter !== 'all' && a.currentStatus !== filter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        a.tag_number.toLowerCase().includes(s) ||
        a.species.toLowerCase().includes(s) ||
        a.breed.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagNumber.trim()) return;

    let targetHerdId = herds[0]?.id;
    if (!targetHerdId) {
      const currentUser = dataService.getCurrentUser();
      const newHerd = await dataService.createHerd({
        name: currentUser?.full_name ? `${currentUser.full_name}'s Herd` : 'Livestock Herd',
        owner_profile_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        location_id: '',
      });
      targetHerdId = newHerd.id;
    }

    await dataService.createAnimal({
      herd_id: targetHerdId,
      tag_number: tagNumber.trim().toUpperCase(),
      species,
      breed,
      sex,
      date_of_birth: dob,
    });

    setShowAddModal(false);
    setTagNumber('');
    loadData();
  };

  const currentHerdName = herds[0]?.name || (dataService.getCurrentUser()?.full_name ? `${dataService.getCurrentUser()?.full_name}'s Dairy` : 'My Livestock Herd');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{t.nav.herd}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {currentHerdName} • {animals.length} {t.dashboard.animalsMonitored}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
        >
          <Plus size={16} />
          <span>Register Animal</span>
        </button>
      </div>

      {/* Health Distribution Summary Bar (Matching Wireframe Screen 13) */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Health Distribution</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Realtime herd census</span>
        </div>

        {/* Stacked Progress Bar */}
        <div
          style={{
            height: '10px',
            borderRadius: 'var(--radius-full)',
            background: '#f1f5f9',
            display: 'flex',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          <div style={{ width: `${(healthyCount / totalCount) * 100}%`, background: 'var(--stable)' }} />
          <div style={{ width: `${(treatmentCount / totalCount) * 100}%`, background: 'var(--warning)' }} />
          <div style={{ width: `${(affectedCount / totalCount) * 100}%`, background: '#fb923c' }} />
          <div style={{ width: `${(criticalCount / totalCount) * 100}%`, background: 'var(--critical)' }} />
        </div>

        {/* 4 Status Metric Counters */}
        <div className="herd-status-grid">
          <div
            onClick={() => setFilter(filter === 'healthy' ? 'all' : 'healthy')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: filter === 'healthy' ? 'var(--stable-bg)' : '#f8fafc',
              border: filter === 'healthy' ? '1.5px solid var(--stable)' : '1px solid var(--border-card)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--stable)' }}>{healthyCount}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.dashboard.healthy}</div>
          </div>

          <div
            onClick={() => setFilter(filter === 'treatment' ? 'all' : 'treatment')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: filter === 'treatment' ? 'var(--warning-bg)' : '#f8fafc',
              border: filter === 'treatment' ? '1.5px solid var(--warning)' : '1px solid var(--border-card)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning)' }}>{treatmentCount}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.dashboard.underTreatment}</div>
          </div>

          <div
            onClick={() => setFilter(filter === 'affected' ? 'all' : 'affected')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: filter === 'affected' ? '#fff7ed' : '#f8fafc',
              border: filter === 'affected' ? '1.5px solid #fb923c' : '1px solid var(--border-card)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ea580c' }}>{affectedCount}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.dashboard.affected}</div>
          </div>

          <div
            onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: filter === 'critical' ? 'var(--critical-bg)' : '#f8fafc',
              border: filter === 'critical' ? '1.5px solid var(--critical)' : '1px solid var(--border-card)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--critical)' }}>{criticalCount}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.dashboard.critical}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by tag number, breed, species..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Animals Grid List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredAnimals.length === 0 ? (
          <div className="glass-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <Users size={26} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
              No livestock registered yet
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 18px auto', lineHeight: 1.5 }}>
              Your herd roster is currently empty. Click the button below to register your cattle, buffalo, or goats with official tag numbers.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.88rem', borderRadius: 'var(--radius-full)', margin: '0 auto' }}
            >
              <Plus size={16} />
              <span>Register First Animal</span>
            </button>
          </div>
        ) : (
          filteredAnimals.map((animal) => {
            const isCrit = animal.currentStatus === 'critical';
            const isTreat = animal.currentStatus === 'treatment';

            return (
              <div
                key={animal.id}
                className="glass-card"
                onClick={() => onSelectAnimal(animal.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{animal.tag_number}</span>
                    <span
                      className={`badge ${
                        isCrit ? 'badge-critical' : isTreat ? 'badge-warning' : 'badge-stable'
                      }`}
                    >
                      {isCrit ? t.dashboard.critical : isTreat ? t.dashboard.underTreatment : t.dashboard.healthy}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {animal.species} • {animal.breed} • {animal.sex}
                  </div>
                  {animal.treatments && animal.treatments.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-hover)', marginTop: '4px' }}>
                      Active: {animal.treatments[0].treatment_name}
                    </div>
                  )}
                </div>

                <ChevronRight size={18} color="var(--text-light)" />
              </div>
            );
          })
        )}
      </div>

      {/* Herd Health Events (Table 13: herd_health_events) */}
      <div className="glass-card" style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Herd-Level Health Incidents (Table: herd_health_events)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Multi-animal symptom clusters, mortality events, and group health tracking
            </p>
          </div>
          <span className="badge-warning" style={{ fontSize: '0.72rem' }}>
            {herdEvents.length} Recorded
          </span>
        </div>

        {herdEvents.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No group health events reported for this herd.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {herdEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: evt.mortality_count > 0 ? 'var(--critical-bg)' : '#f8fafc',
                  border: `1px solid ${evt.mortality_count > 0 ? 'var(--critical-border)' : 'var(--border-subtle)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle
                    size={18}
                    color={evt.mortality_count > 0 ? 'var(--critical)' : 'var(--warning)'}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {evt.event_type.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {evt.description}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700, color: evt.mortality_count > 0 ? 'var(--critical)' : 'var(--text-main)' }}>
                    {evt.affected_count} affected {evt.mortality_count > 0 && `• ${evt.mortality_count} deaths`}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>{evt.event_date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Livestock Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Register New Livestock</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnimal}>
              <div className="form-group">
                <label className="form-label">Ear Tag Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COW-099"
                  value={tagNumber}
                  onChange={(e) => setTagNumber(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Species</label>
                <select value={species} onChange={(e) => setSpecies(e.target.value)} className="form-select">
                  <option value="Cattle">Cattle (गाय)</option>
                  <option value="Buffalo">Buffalo (म्हैस)</option>
                  <option value="Goat">Goat (शेळी)</option>
                  <option value="Sheep">Sheep (मेंढी)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Breed</label>
                <input
                  type="text"
                  required
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g. Gir, Murrah, Osmanabadi"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Sex</label>
                  <select value={sex} onChange={(e) => setSex(e.target.value as any)} className="form-select">
                    <option value="female">Female (मादी)</option>
                    <option value="male">Male (नर)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '12px', padding: '12px' }}
              >
                Register Animal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
