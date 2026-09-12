// JeevRakshak AI - Regional Risk Engine & Geographic Matcher
// Filters farmers and veterinarians strictly within the targeted risk zone

import { Profile } from '@/types/database';
import { DiseaseAlert, TargetAudience, AlertRiskLevel } from '@/types/notificationSystem';

export interface RegionalRecipientMatch {
  profile: Profile;
  role: 'farmer' | 'veterinarian' | 'government';
  inImmediateZone: boolean;
  distanceTier: 'village' | 'block' | 'district';
}

function normalizeGeo(val?: string | null): string {
  if (!val) return '';
  return val.trim().toLowerCase().replace(/[\s\-_]+/g, '');
}

/**
 * Evaluates whether a user's location matches an alert's geographic criteria.
 * Supports District -> Taluka/Block -> Village hierarchy.
 */
export function isUserInAlertRegion(
  user: Profile,
  alert: { district: string; block?: string; village?: string; region_level: string }
): { matches: boolean; tier: 'village' | 'block' | 'district' } {
  const alertDist = normalizeGeo(alert.district);
  const alertBlock = normalizeGeo(alert.block);
  const alertVillage = normalizeGeo(alert.village);

  // User location fields (checking both direct fields and hospital metadata for vets)
  const userDist = normalizeGeo(user.district || user.hospital_district);
  const userBlock = normalizeGeo(user.block || user.hospital_block);
  const userVillage = normalizeGeo(user.village);

  // 1. If district doesn't match, user is outside the affected zone entirely
  if (alertDist && userDist && alertDist !== userDist) {
    return { matches: false, tier: 'district' };
  }

  // 2. Village-level alert
  if (alert.region_level === 'village' && alertVillage) {
    if (userVillage && userVillage === alertVillage) {
      return { matches: true, tier: 'village' };
    }
    // Veterinarians in the same block are considered immediate zone responders
    if (user.hospital_name && userBlock && alertBlock && userBlock === alertBlock) {
      return { matches: true, tier: 'village' };
    }
    return { matches: false, tier: 'village' };
  }

  // 3. Block/Taluka-level alert
  if (alert.region_level === 'block' && alertBlock) {
    if (userBlock && userBlock === alertBlock) {
      return { matches: true, tier: 'block' };
    }
    return { matches: false, tier: 'block' };
  }

  // 4. District-level alert
  if (alertDist && (userDist === alertDist || !userDist)) {
    return { matches: true, tier: 'district' };
  }

  return { matches: false, tier: 'district' };
}

/**
 * Filters a list of profiles to find recipients matching the alert's region and target audience.
 */
export function findRecipientsForAlert(
  profiles: Profile[],
  alert: DiseaseAlert,
  userRolesMap: Map<string, 'farmer' | 'veterinarian' | 'government'>
): RegionalRecipientMatch[] {
  const recipients: RegionalRecipientMatch[] = [];

  for (const p of profiles) {
    if (!p.is_active) continue;

    const role = userRolesMap.get(p.id) || (p.license_number || p.hospital_name ? 'veterinarian' : 'farmer');

    // Audience filter
    if (alert.target_audience === 'farmers' && role !== 'farmer') continue;
    if (alert.target_audience === 'vets' && role !== 'veterinarian') continue;

    const { matches, tier } = isUserInAlertRegion(p, alert);
    if (matches) {
      recipients.push({
        profile: p,
        role,
        inImmediateZone: tier === 'village' || tier === 'block',
        distanceTier: tier,
      });
    }
  }

  return recipients;
}
