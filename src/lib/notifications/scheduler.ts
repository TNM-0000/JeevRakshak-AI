// JeevRakshak AI - Vaccination & Alert Automation Scheduler
// Runs automated evaluation for upcoming/overdue vaccinations & expiring alerts with strict idempotency

import { AnimalVaccination, Animal, Herd, Profile } from '@/types/database';
import { DiseaseAlert } from '@/types/notificationSystem';
import { notificationService } from './notificationService';

export interface SchedulerExecutionResult {
  timestamp: string;
  vaccinationsEvaluated: number;
  upcomingRemindersSent: number;
  dueRemindersSent: number;
  overdueRemindersSent: number;
  vetInterventionsSent: number;
  alertsEvaluated: number;
  alertsExpiredCount: number;
}

/**
 * Calculates day difference between target date and current time.
 */
function getDaysDifference(targetDateStr: string): number {
  const target = new Date(targetDateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates vaccination countdowns and dispatches targeted multi-channel alerts.
 */
export async function runSchedulerCycle(params: {
  vaccinations: AnimalVaccination[];
  animals: Animal[];
  herds: Herd[];
  profiles: Profile[];
  diseaseAlerts: DiseaseAlert[];
  onExpireAlert?: (alertId: string) => void;
}): Promise<SchedulerExecutionResult> {
  const { vaccinations, animals, herds, profiles, diseaseAlerts, onExpireAlert } = params;

  let upcomingCount = 0;
  let dueCount = 0;
  let overdueCount = 0;
  let vetInterventionsCount = 0;
  let expiredAlertsCount = 0;

  // Build lookup maps for performance
  const animalMap = new Map<string, Animal>(animals.map((a) => [String(a.id), a]));
  const herdMap = new Map<string, Herd>(herds.map((h) => [String(h.id), h]));
  const profileMap = new Map<string, Profile>(profiles.map((p) => [String(p.id), p]));

  // Track overdue vaccinations per district/block for veterinarians
  const overdueByDistrict = new Map<string, number>();

  const now = new Date();

  // 1. Process Animal Vaccinations
  for (const vac of vaccinations) {
    if (!vac.next_due_date) continue;

    const animal = animalMap.get(String(vac.animal_id));
    if (!animal) continue;

    const herd = herdMap.get(String(animal.herd_id));
    const owner = herd ? profileMap.get(String(herd.owner_profile_id)) : null;
    if (!owner) continue;

    const daysUntilDue = getDaysDifference(vac.next_due_date);
    const regionName = owner.village ? `${owner.village}, ${owner.block || owner.district}` : owner.district || 'Pune';

    // A. 7 Days Before (Upcoming) -> SMS + Email
    if (daysUntilDue === 7 || (daysUntilDue > 0 && daysUntilDue <= 7)) {
      const relatedEventId = `vac_${vac.id}_7d_${vac.next_due_date}`;
      const res = await notificationService.dispatch({
        type: 'VACCINATION_UPCOMING',
        userId: owner.id,
        userName: owner.full_name,
        userPhone: owner.phone || undefined,
        userEmail: owner.email || undefined,
        userRole: 'farmer',
        region: regionName,
        relatedEventId,
        preferredChannels: ['sms', 'email'],
        variables: {
          farmer_name: owner.full_name,
          animal_tag: animal.tag_number,
          animal_type: animal.species,
          vaccine_name: vac.vaccine_name,
          due_date: vac.next_due_date,
          recommended_action: `Schedule an appointment with your local veterinary polyclinic before ${vac.next_due_date}.`,
        },
      });

      if (res.smsResult?.sent || res.emailResult?.sent) {
        upcomingCount++;
      }
    }
    // B. Due Date (0 days) -> SMS + Email
    else if (daysUntilDue === 0) {
      const relatedEventId = `vac_${vac.id}_due_${vac.next_due_date}`;
      const res = await notificationService.dispatch({
        type: 'VACCINATION_DUE',
        userId: owner.id,
        userName: owner.full_name,
        userPhone: owner.phone || undefined,
        userEmail: owner.email || undefined,
        userRole: 'farmer',
        region: regionName,
        relatedEventId,
        preferredChannels: ['sms', 'email'],
        variables: {
          farmer_name: owner.full_name,
          animal_tag: animal.tag_number,
          animal_type: animal.species,
          vaccine_name: vac.vaccine_name,
          due_date: vac.next_due_date,
          contact_information: 'Local Veterinary Dispensary / Helpline: 1962',
        },
      });

      if (res.smsResult?.sent || res.emailResult?.sent) {
        dueCount++;
      }
    }
    // C. Overdue (< 0 days) -> Weekly cadence idempotency key
    else if (daysUntilDue < 0) {
      const overdueDays = Math.abs(daysUntilDue);
      const districtKey = (owner.district || 'pune').toLowerCase();
      overdueByDistrict.set(districtKey, (overdueByDistrict.get(districtKey) || 0) + 1);

      // Bucket into weekly milestones (Day 1, Day 7, Day 14, etc.) to prevent spamming
      const weekBucket = Math.floor(overdueDays / 7);
      const relatedEventId = `vac_${vac.id}_overdue_w${weekBucket}`;

      const res = await notificationService.dispatch({
        type: 'VACCINATION_OVERDUE',
        userId: owner.id,
        userName: owner.full_name,
        userPhone: owner.phone || undefined,
        userEmail: owner.email || undefined,
        userRole: 'farmer',
        region: regionName,
        relatedEventId,
        preferredChannels: ['sms', 'email'],
        variables: {
          farmer_name: owner.full_name,
          animal_tag: animal.tag_number,
          animal_type: animal.species,
          vaccine_name: vac.vaccine_name,
          due_date: vac.next_due_date,
          overdue_days: overdueDays,
          region: regionName,
        },
      });

      if (res.smsResult?.sent || res.emailResult?.sent) {
        overdueCount++;
      }
    }
  }

  // 2. Dispatch Operational Intervention Directives to Area Veterinarians
  const veterinarians = profiles.filter((p) => Boolean(p.license_number || p.hospital_name));
  for (const vet of veterinarians) {
    const vetDist = (vet.district || vet.hospital_district || 'pune').toLowerCase();
    const overdueTotal = overdueByDistrict.get(vetDist) || 0;

    if (overdueTotal > 0) {
      // Send once per week to vet
      const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
      const relatedEventId = `vet_interv_${vet.id}_${weekNumber}`;

      const res = await notificationService.dispatch({
        type: 'VET_INTERVENTION_ALERT',
        userId: vet.id,
        userName: vet.full_name,
        userPhone: vet.phone || vet.emergency_phone || undefined,
        userEmail: vet.email || undefined,
        userRole: 'veterinarian',
        region: vet.block || vet.district || 'Pune',
        relatedEventId,
        preferredChannels: ['sms', 'email'],
        variables: {
          vet_name: vet.full_name,
          disease_name: 'FMD / Brucellosis',
          risk_level: 'MODERATE',
          overdue_count: overdueTotal,
          reports_requiring_review: 3,
          case_count: 5,
          recommended_action: 'Organize targeted ring vaccination camps for overdue herds in your sector.',
        },
      });

      if (res.smsResult?.sent || res.emailResult?.sent) {
        vetInterventionsCount++;
      }
    }
  }

  // 3. Evaluate Expired Disease Alerts
  for (const alert of diseaseAlerts) {
    if (alert.status === 'active') {
      const expiry = new Date(alert.alert_expiry_date);
      if (expiry < now) {
        alert.status = 'expired';
        expiredAlertsCount++;
        if (onExpireAlert) {
          onExpireAlert(alert.id);
        }
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    vaccinationsEvaluated: vaccinations.length,
    upcomingRemindersSent: upcomingCount,
    dueRemindersSent: dueCount,
    overdueRemindersSent: overdueCount,
    vetInterventionsSent: vetInterventionsCount,
    alertsEvaluated: diseaseAlerts.length,
    alertsExpiredCount: expiredAlertsCount,
  };
}
