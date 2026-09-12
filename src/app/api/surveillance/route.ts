import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/serverClient';
import { forecastOutbreak } from '@/lib/ai/outbreakForecaster';
import { CaseGeoPoint, OutbreakForecastInput } from '@/lib/ai/contracts';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const districtFilter = searchParams.get('district');
    const daysParam = parseInt(searchParams.get('days') || '30', 10);

    const cutoffDate = new Date(Date.now() - daysParam * 24 * 60 * 60 * 1000).toISOString();

    // 1. Query recent health reports with herd location data
    const reportsQuery = supabaseServer
      .from('health_reports')
      .select(`
        id,
        reported_at,
        mortality_count,
        symptoms,
        animals (
          id,
          species,
          tag_number,
          herds (
            id,
            name,
            administrative_locations (
              id,
              name,
              latitude,
              longitude,
              district,
              taluka,
              village
            )
          )
        ),
        case_assessments (
          status,
          triage_method
        ),
        health_report_diseases (
          disease_id,
          is_primary,
          disease_catalog (
            id,
            name,
            name_en,
            name_hi,
            name_mr,
            severity
          )
        )
      `)
      .gte('reported_at', cutoffDate)
      .order('reported_at', { ascending: false });

    const { data: reportsData, error: reportsError } = await reportsQuery;

    if (reportsError) {
      console.warn('[API/Surveillance] Query error:', reportsError);
    }

    // 2. Query official outbreak events
    const { data: outbreaksData } = await supabaseServer
      .from('outbreak_events')
      .select('*, administrative_locations(*), disease_catalog(*)')
      .order('started_at', { ascending: false });

    // 3. Query weather observations for environmental risk factor
    const { data: weatherData } = await supabaseServer
      .from('weather_observations')
      .select('*')
      .order('observed_at', { ascending: false })
      .limit(10);

    // 4. Transform into spatial CaseGeoPoint array
    const cases: CaseGeoPoint[] = [];
    const rawReports = reportsData || [];

    rawReports.forEach((r: any) => {
      const loc = r.animals?.herds?.administrative_locations;
      // If coordinates are present or fallback to Pune coordinates with jitter
      const lat = loc?.latitude || 18.5204 + (Math.random() - 0.5) * 0.08;
      const lng = loc?.longitude || 73.8567 + (Math.random() - 0.5) * 0.08;
      const district = loc?.district || loc?.name || 'Pune';
      const taluka = loc?.taluka || 'Shirur';
      const village = loc?.village || 'Ranjangaon';

      if (!districtFilter || district.toLowerCase() === districtFilter.toLowerCase()) {
        const primaryDis = r.health_report_diseases?.find((d: any) => d.is_primary)?.disease_catalog;
        cases.push({
          id: r.id,
          diseaseId: primaryDis?.id || 'dis-fmd',
          diseaseName: primaryDis?.name || 'Suspected Livestock Outbreak',
          latitude: lat,
          longitude: lng,
          reportedAt: r.reported_at,
          mortalityCount: r.mortality_count || 0,
          district,
          taluka,
          village,
        });
      }
    });

    // 5. Run Outbreak Forecaster spatial clustering engine
    const avgWeather = weatherData && weatherData.length > 0 ? {
      avgTemperatureC: weatherData.reduce((acc, w) => acc + (w.temperature_c || 28), 0) / weatherData.length,
      avgHumidityPercent: weatherData.reduce((acc, w) => acc + (w.humidity_percent || 70), 0) / weatherData.length,
      rainfallMm: weatherData.reduce((acc, w) => acc + (w.rainfall_mm || 0), 0) / weatherData.length,
    } : undefined;

    const forecastInput: OutbreakForecastInput = {
      cases,
      district: districtFilter || 'Pune',
      timeHorizonDays: 7,
      clusteringRadiusKm: 5.0,
      environmentalData: avgWeather,
    };

    const forecast = await forecastOutbreak(forecastInput);

    // 6. Aggregate District and Taluka statistics
    const talukaBreakdown: Record<string, { totalCases: number; mortality: number; activeClusters: number }> = {};
    cases.forEach(c => {
      const key = c.taluka || 'Shirur';
      if (!talukaBreakdown[key]) {
        talukaBreakdown[key] = { totalCases: 0, mortality: 0, activeClusters: 0 };
      }
      talukaBreakdown[key].totalCases += 1;
      talukaBreakdown[key].mortality += c.mortalityCount;
    });

    forecast.activeClusters.forEach(cl => {
      if (talukaBreakdown[cl.primaryTaluka]) {
        talukaBreakdown[cl.primaryTaluka].activeClusters += 1;
      }
    });

    return NextResponse.json({
      success: true,
      surveillanceMetrics: {
        totalReportsInRange: cases.length,
        activeOutbreaksCount: (outbreaksData || []).filter(o => o.status === 'active').length,
        activeClustersCount: forecast.activeClusters.length,
        totalMortality: cases.reduce((acc, c) => acc + c.mortalityCount, 0),
        overallRiskLevel: forecast.overallDistrictRisk,
        projected7DayCases: forecast.projectedCasesNext7Days,
      },
      forecast,
      activeClusters: forecast.activeClusters,
      containmentZones: forecast.containmentZones,
      hotspots: forecast.criticalHotspots,
      talukaBreakdown,
      outbreaks: outbreaksData || [],
      recentCases: cases.slice(0, 50),
    });
  } catch (err: any) {
    console.error('[API/Surveillance] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Surveillance service error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      disease_id,
      location_id,
      title,
      title_en,
      title_hi,
      title_mr,
      description,
      description_en,
      description_hi,
      description_mr,
      severity = 'high',
      affected_herds = 1,
      affected_animals = 5,
      mortality_count = 0,
      created_by = 'prof-gov-1',
    } = body;

    if (!disease_id || !location_id || !title) {
      return NextResponse.json(
        { error: 'disease_id, location_id, and title are mandatory to declare an outbreak.' },
        { status: 400 }
      );
    }

    // Insert official outbreak
    const { data: outbreakRows, error: outbreakError } = await supabaseServer
      .from('outbreak_events')
      .insert([
        {
          disease_id,
          location_id,
          title,
          title_en: title_en || title,
          title_hi: title_hi || title,
          title_mr: title_mr || title,
          description: description || `Official livestock outbreak declared: ${title}`,
          description_en: description_en || description || `Official livestock outbreak declared: ${title}`,
          description_hi: description_hi || description,
          description_mr: description_mr || description,
          severity,
          affected_herds: Number(affected_herds) || 1,
          affected_animals: Number(affected_animals) || 5,
          mortality_count: Number(mortality_count) || 0,
          status: 'active',
          created_by,
        },
      ])
      .select();

    if (outbreakError || !outbreakRows || outbreakRows.length === 0) {
      return NextResponse.json({ error: outbreakError?.message || 'Outbreak insert failed' }, { status: 500 });
    }

    const createdOutbreak = outbreakRows[0];

    // Broadcast outbreak alert to all veterinarians and farmers
    const { data: profiles } = await supabaseServer
      .from('profiles')
      .select('id, role')
      .limit(50);

    if (profiles && profiles.length > 0) {
      const broadcastNotifs = profiles.map(p => ({
        recipient_profile_id: p.id,
        outbreak_event_id: createdOutbreak.id,
        title: `OUTBREAK DECLARATION: ${title}`,
        title_en: `OUTBREAK DECLARATION: ${title}`,
        title_hi: `महामारी की घोषणा: ${title}`,
        title_mr: `रोग उद्रेक घोषित: ${title}`,
        message: `Government Animal Husbandry Department has declared an active outbreak. Quarantine protocols and movement restrictions are in effect.`,
        message_en: `Government Animal Husbandry Department has declared an active outbreak. Quarantine protocols and movement restrictions are in effect.`,
        message_hi: `पशुपालन विभाग ने सक्रिय प्रकोप घोषित किया है। संगरोध नियम प्रभावी हैं।`,
        message_mr: `पशुसंवर्धन विभागातर्फे सक्रिय रोग उद्रेक जाहीर. तात्काळ प्रतिबंधात्मक उपाययोजना सुरू करा.`,
        notification_type: 'outbreak_alert',
        is_read: false,
        language: 'en',
      }));

      await supabaseServer.from('notifications').insert(broadcastNotifs);
    }

    return NextResponse.json({
      success: true,
      outbreak: createdOutbreak,
      alertDispatched: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Outbreak declaration failure' }, { status: 500 });
  }
}
