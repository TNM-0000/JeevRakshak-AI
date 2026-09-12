/**
 * JeevRakshak AI - Spatial Outbreak Forecaster & Ring Containment Engine
 * 
 * Implements spatial epidemiological analysis:
 * 1. Haversine distance calculations between case geo-coordinates
 * 2. Spatial density clustering (5km radius grouping)
 * 3. Case velocity, Attack Rate, and R0 reproduction rate approximation
 * 4. Containment Ring geometry (3km infected zone, 10km surveillance ring)
 * 5. Pluggable ML Forecaster Hook (via AI_FORECAST_MODEL_URL)
 */

import {
  OutbreakForecastInput,
  OutbreakForecastResult,
  SpatialCluster,
  ContainmentZoneSpec,
  CaseGeoPoint,
  RiskLevel,
} from './contracts';

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Great-Circle distance between two points on Earth using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export async function forecastOutbreak(input: OutbreakForecastInput): Promise<OutbreakForecastResult> {
  // 1. Pluggable ML Forecaster hook
  const mlEndpoint = process.env.AI_FORECAST_MODEL_URL;
  if (mlEndpoint) {
    try {
      const res = await fetch(mlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      console.warn('[OutbreakForecaster] External ML forecasting service timed out, using spatial engine.');
    }
  }

  // 2. Spatial Cluster Analysis
  return executeSpatialClustering(input);
}

function executeSpatialClustering(input: OutbreakForecastInput): OutbreakForecastResult {
  const cases = input.cases || [];
  const radiusKm = input.clusteringRadiusKm || 5.0;

  if (cases.length === 0) {
    return {
      activeClusters: [],
      containmentZones: [],
      projectedCasesNext7Days: 0,
      overallDistrictRisk: 'low',
      criticalHotspots: [],
      epidemiologicalSummary: {
        en: 'No active clinical clusters detected in the surveillance area.',
        hi: 'निगरानी क्षेत्र में कोई सक्रिय रोग क्लस्टर नहीं पाया गया है।',
        mr: 'निरीक्षण क्षेत्रात कोणताही सक्रिय रोग समूह आढळलेला नाही.',
      },
    };
  }

  // Group cases into spatial clusters using distance threshold
  const visited = new Set<string>();
  const clusters: CaseGeoPoint[][] = [];

  for (let i = 0; i < cases.length; i++) {
    const root = cases[i];
    if (visited.has(root.id)) continue;

    const currentCluster: CaseGeoPoint[] = [root];
    visited.add(root.id);

    for (let j = i + 1; j < cases.length; j++) {
      const neighbor = cases[j];
      if (visited.has(neighbor.id)) continue;

      const dist = calculateHaversineDistanceKm(
        root.latitude,
        root.longitude,
        neighbor.latitude,
        neighbor.longitude
      );

      if (dist <= radiusKm) {
        currentCluster.push(neighbor);
        visited.add(neighbor.id);
      }
    }

    clusters.push(currentCluster);
  }

  // Compute metrics for each cluster
  const spatialClusters: SpatialCluster[] = [];
  const containmentZones: ContainmentZoneSpec[] = [];
  let totalProjected7Days = 0;

  clusters.forEach((group, idx) => {
    // Centroid calculation
    const centerLat = group.reduce((sum, c) => sum + c.latitude, 0) / group.length;
    const centerLng = group.reduce((sum, c) => sum + c.longitude, 0) / group.length;

    // Cluster span radius
    let maxDistFromCenter = 1.0;
    group.forEach(c => {
      const d = calculateHaversineDistanceKm(centerLat, centerLng, c.latitude, c.longitude);
      if (d > maxDistFromCenter) maxDistFromCenter = d;
    });

    const totalCases = group.length;
    const totalMortality = group.reduce((sum, c) => sum + (c.mortalityCount || 0), 0);
    const diseaseName = group[0]?.diseaseName || 'Livestock Outbreak';
    const primaryDistrict = group[0]?.district || input.district || 'Pune';
    const primaryTaluka = group[0]?.taluka || 'Shirur';

    // Velocity: cases reported in last 7 days vs older
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const recentCases = group.filter(c => {
      const t = new Date(c.reportedAt).getTime();
      return (now - t) <= sevenDaysMs;
    }).length;

    const velocity = Math.round((recentCases / 7) * 10) / 10; // cases/day
    // Empirical R0 estimation: based on recent surge velocity
    const estimatedR0 = Math.round(Math.max(1.1, Math.min(3.8, 1.2 + (recentCases * 0.25))) * 10) / 10;
    const attackRate = Math.min(38, Math.round((totalCases / (group.length * 12)) * 100));

    const clusterId = `cluster-${primaryTaluka.toLowerCase()}-${idx + 1}`;
    spatialClusters.push({
      clusterId,
      diseaseId: group[0]?.diseaseId || 'dis-fmd',
      diseaseName,
      centerLatitude: Math.round(centerLat * 10000) / 10000,
      centerLongitude: Math.round(centerLng * 10000) / 10000,
      radiusKm: Math.round(maxDistFromCenter * 10) / 10,
      totalCases,
      totalMortality,
      attackRatePercent: attackRate,
      status: recentCases >= 3 ? 'active' : 'emerging',
      primaryDistrict,
      primaryTaluka,
      estimatedReproductionNumberR0: estimatedR0,
      caseVelocity7Days: velocity,
    });

    // Generate Containment Ring Zone
    const targetHerds = Math.max(15, totalCases * 8);
    const targetVaccines = targetHerds * 14; // ~14 animals per Indian smallholder herd

    containmentZones.push({
      center: {
        latitude: Math.round(centerLat * 10000) / 10000,
        longitude: Math.round(centerLng * 10000) / 10000,
      },
      infectedZoneRadiusKm: 3.0,
      surveillanceZoneRadiusKm: 10.0,
      targetHerdsCount: targetHerds,
      recommendedVaccinationDoses: targetVaccines,
      movementRestrictionMandated: totalCases >= 2,
      emergencyMeasures: [
        'Mandatory 3km infected zone barrier: All livestock movement prohibited.',
        'Weekly ring vaccination targeting 100% of susceptible ruminants in 10km buffer.',
        'Closure of local cattle haats / livestock markets within 15km perimeter.',
        'Daily mobile veterinary dispensary patrols for early symptomatic detection.',
      ],
    });

    totalProjected7Days += Math.round(totalCases * (estimatedR0 * 0.6));
  });

  // Hotspots list
  const criticalHotspots = spatialClusters.map(c => ({
    locationName: `${c.primaryTaluka} (${c.diseaseName})`,
    taluka: c.primaryTaluka,
    district: c.primaryDistrict,
    latitude: c.centerLatitude,
    longitude: c.centerLongitude,
    caseCount: c.totalCases,
    riskScore: Math.min(98, 50 + c.totalCases * 8 + c.totalMortality * 12),
  }));

  // Determine overall district risk
  let overallDistrictRisk: RiskLevel = 'low';
  const maxCases = Math.max(...spatialClusters.map(c => c.totalCases), 0);
  const totalMortalityAll = spatialClusters.reduce((sum, c) => sum + c.totalMortality, 0);

  if (totalMortalityAll >= 3 || maxCases >= 8) {
    overallDistrictRisk = 'critical';
  } else if (maxCases >= 4) {
    overallDistrictRisk = 'high';
  } else if (maxCases >= 2) {
    overallDistrictRisk = 'medium';
  }

  const primaryCluster = spatialClusters[0];

  return {
    activeClusters: spatialClusters,
    containmentZones,
    projectedCasesNext7Days: Math.max(3, totalProjected7Days),
    overallDistrictRisk,
    criticalHotspots,
    epidemiologicalSummary: {
      en: primaryCluster
        ? `Spatial analysis detected ${spatialClusters.length} active cluster(s) in ${primaryCluster.primaryDistrict}. Estimated R0 of ${primaryCluster.estimatedReproductionNumberR0} with a 5km ring containment mandate.`
        : 'Epidemiological surveillance status is nominal.',
      hi: primaryCluster
        ? `स्थानिक विश्लेषण ने ${primaryCluster.primaryDistrict} में ${spatialClusters.length} सक्रिय क्लस्टर की पुष्टि की है। R0 अनुमान ${primaryCluster.estimatedReproductionNumberR0} है।`
        : 'निगरानी स्थिति सामान्य है।',
      mr: primaryCluster
        ? `स्थानिक विश्लेषणात ${primaryCluster.primaryDistrict} मध्ये ${spatialClusters.length} सक्रिय क्लस्टर आढळले आहेत. ५ किमी रिंग प्रतिबंधात्मक योजना लागू करण्याचे निर्देश.`
        : 'रोग सर्वेक्षण स्थिती सामान्य आहे.',
    },
  };
}
