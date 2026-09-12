import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district') || 'Pune';

    // 1. Fetch recent weather observations
    const { data: weatherRows, error: weatherError } = await supabaseServer
      .from('weather_observations')
      .select('*, administrative_locations(*)')
      .order('observed_at', { ascending: false })
      .limit(20);

    if (weatherError) {
      console.warn('[API/Epidemiology/Risk] Weather fetch error:', weatherError);
    }

    // Default reference climate if none recorded yet
    const latestWeather = weatherRows?.[0] || {
      temperature_c: 31.5,
      humidity_percent: 78.0,
      rainfall_mm: 14.2,
      wind_speed_kmh: 12.0,
    };

    const T = latestWeather.temperature_c || 30;
    const RH = latestWeather.humidity_percent || 75;
    const rain = latestWeather.rainfall_mm || 10;

    // 2. Temperature-Humidity Index (THI) calculation
    const thi = Math.round((0.8 * T + (RH / 100) * (T - 14.4) + 46.4) * 10) / 10;

    let heatStressCategory = 'Normal';
    if (thi >= 89) heatStressCategory = 'Severe Heat Stress';
    else if (thi >= 79) heatStressCategory = 'Moderate Heat Stress';
    else if (thi >= 72) heatStressCategory = 'Mild Heat Stress';

    // 3. Vector-Borne Surge Risk (LSD, Bluetongue - Culicoides & Ticks)
    let vectorRiskScore = 30;
    if (RH > 70 && T >= 24 && T <= 34) {
      vectorRiskScore = Math.min(95, Math.round(55 + (RH - 70) * 1.5 + (T - 24) * 2));
    }

    // 4. Anthrax & Blackleg Spore Dispersal Risk (heavy rain leaching)
    let sporeDispersalRisk = 25;
    if (rain > 25) {
      sporeDispersalRisk = Math.min(90, Math.round(40 + rain * 1.2));
    }

    // Overall Environmental Risk Index (0 - 100)
    const overallRiskScore = Math.round((vectorRiskScore * 0.45 + (thi > 78 ? 75 : 35) * 0.3 + sporeDispersalRisk * 0.25));

    let overallRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (overallRiskScore >= 75) overallRiskLevel = 'high';
    else if (overallRiskScore >= 55) overallRiskLevel = 'medium';

    return NextResponse.json({
      success: true,
      district,
      currentObservation: latestWeather,
      indices: {
        thi: {
          score: thi,
          category: heatStressCategory,
          clinicalImpact: thi >= 78 ? 'Suppressed immune response; reduced lactation yield by 15-25%.' : 'Nominal thermal comfort range.',
        },
        vectorSurge: {
          score: vectorRiskScore,
          threatLevel: vectorRiskScore > 70 ? 'High' : vectorRiskScore > 50 ? 'Moderate' : 'Low',
          susceptibleDiseases: ['Lumpy Skin Disease (LSD)', 'Theileriosis', 'Bluetongue'],
          recommendation: 'Apply cypermethrin or neem oil spray around sheds. Drain stagnant runoff ponds.',
        },
        bacterialSporeRisk: {
          score: sporeDispersalRisk,
          threatLevel: sporeDispersalRisk > 65 ? 'Elevated' : 'Low',
          susceptibleDiseases: ['Anthrax', 'Blackleg (BQ)', 'Hemorrhagic Septicemia (HS)'],
          recommendation: 'Prevent grazing on low-lying flooded pastures where dormant spores resurface.',
        },
      },
      overallEnvironmentalRisk: {
        score: overallRiskScore,
        level: overallRiskLevel,
      },
      advisoryAlert: {
        en: `Environmental Risk in ${district}: ${overallRiskLevel.toUpperCase()} (Index: ${overallRiskScore}/100). Elevated humidity (${RH}%) triggers high vector proliferation.`,
        hi: `${district} में मौसमी जोखिम: ${overallRiskLevel.toUpperCase()} (स्कोर: ${overallRiskScore}/100)। उच्च आर्द्रता (${RH}%) से मच्छर और मक्खियों का प्रकोप।`,
        mr: `${district} हवामान जोखीम: ${overallRiskLevel.toUpperCase()} (निर्देशांक: ${overallRiskScore}/100). हवेतील दमटपणा (${RH}%) वाढल्याने डास व गोचीड प्रादुर्भाव वाढू शकतो.`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Environmental risk calculation error' }, { status: 500 });
  }
}
