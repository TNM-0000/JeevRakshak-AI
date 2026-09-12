import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/serverClient';
import { predictDisease } from '@/lib/ai/diseasePredictor';
import { DiseasePredictionInput } from '@/lib/ai/contracts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      animal_id,
      reported_by,
      source = 'mobile',
      symptoms,
      mortality_count = 0,
      notes,
      vitals,
      language = 'en',
    } = body;

    if (!animal_id || !reported_by || !symptoms) {
      return NextResponse.json(
        { error: 'Missing required fields: animal_id, reported_by, and symptoms are mandatory.' },
        { status: 400 }
      );
    }

    // 1. Fetch animal and herd context for high-fidelity clinical triage
    const { data: animalData } = await supabaseServer
      .from('animals')
      .select('*, herds(*, administrative_locations(*))')
      .eq('id', animal_id)
      .maybeSingle();

    const rawAnimal: any = animalData;
    const species = rawAnimal?.species || 'Cattle';
    const breed = rawAnimal?.breed;
    const herd: any = Array.isArray(rawAnimal?.herds) ? rawAnimal.herds[0] : rawAnimal?.herds;
    const loc: any = Array.isArray(herd?.administrative_locations) ? herd.administrative_locations[0] : herd?.administrative_locations;
    const location = loc
      ? {
          latitude: loc.latitude || 18.5204,
          longitude: loc.longitude || 73.8567,
          district: loc.district || loc.name,
          taluka: loc.taluka,
          village: loc.village,
        }
      : undefined;

    // 2. Execute Clinical Disease Predictor Engine (Pluggable AI or ICAR heuristic)
    const predictionInput: DiseasePredictionInput = {
      animalId: animal_id,
      species,
      breed,
      symptoms,
      mortalityCount: Number(mortality_count) || 0,
      vitals,
      notes,
      location,
      language,
    };

    const triageResult = await predictDisease(predictionInput);

    // 3. Atomically persist to Database Layer
    // Step 3a: Insert health_reports
    const { data: reportRows, error: reportError } = await supabaseServer
      .from('health_reports')
      .insert([
        {
          animal_id,
          reported_by,
          source,
          symptoms: typeof symptoms === 'string' ? symptoms : symptoms.join(', '),
          symptoms_en: typeof symptoms === 'string' ? symptoms : symptoms.join(', '),
          mortality_count: Number(mortality_count) || 0,
          notes: notes || triageResult.multilingualNotes.en,
          notes_en: notes || triageResult.multilingualNotes.en,
          notes_hi: triageResult.multilingualNotes.hi,
          notes_mr: triageResult.multilingualNotes.mr,
        },
      ])
      .select();

    if (reportError || !reportRows || reportRows.length === 0) {
      console.error('[API/Triage] Failed to insert health_report:', reportError);
      return NextResponse.json(
        { error: 'Failed to record health report in database', details: reportError },
        { status: 500 }
      );
    }

    const createdReport = reportRows[0];
    const reportId = createdReport.id;

    // Step 3b: Insert case_assessments
    const { data: assessmentRows, error: assessmentError } = await supabaseServer
      .from('case_assessments')
      .insert([
        {
          health_report_id: reportId,
          status: triageResult.triageStatus,
          triage_method: triageResult.triageMethod,
          assessment_notes: triageResult.multilingualNotes.en,
          assessment_notes_en: triageResult.multilingualNotes.en,
          assessment_notes_hi: triageResult.multilingualNotes.hi,
          assessment_notes_mr: triageResult.multilingualNotes.mr,
          assessed_by: 'JeevRakshak AI Triage Engine',
        },
      ])
      .select();

    if (assessmentError) {
      console.warn('[API/Triage] Warning: case_assessment insert error:', assessmentError);
    }

    // Step 3c: Insert risk_assessments
    const { data: riskRows, error: riskError } = await supabaseServer
      .from('risk_assessments')
      .insert([
        {
          health_report_id: reportId,
          location_id: herd?.location_id || null,
          risk_level: triageResult.riskLevel,
          risk_score: triageResult.riskScore,
          assessment_method: triageResult.triageMethod,
          reasoning: `${triageResult.primaryDisease.diseaseName} detected with ${triageResult.primaryDisease.confidence}% clinical confidence. ${triageResult.multilingualNotes.en}`,
          assessed_by: 'JeevRakshak AI Epidemiological Model',
        },
      ])
      .select();

    if (riskError) {
      console.warn('[API/Triage] Warning: risk_assessment insert error:', riskError);
    }

    // Step 3d: Link Disease Catalog if matched
    if (triageResult.primaryDisease.diseaseId) {
      await supabaseServer
        .from('health_report_diseases')
        .insert([
          {
            health_report_id: reportId,
            disease_id: triageResult.primaryDisease.diseaseId,
            is_primary: true,
            confidence: triageResult.primaryDisease.confidence / 100,
            notes: `Primary triage match. Differential diagnoses count: ${triageResult.differentials.length}`,
          },
        ]);
    }

    // Step 3e: If critical or high risk, dispatch urgent notification to field vets
    if (triageResult.riskLevel === 'critical' || triageResult.riskLevel === 'high' || mortality_count > 0) {
      // Find local veterinarians
      const { data: vets } = await supabaseServer
        .from('profiles')
        .select('id')
        .eq('role', 'veterinarian')
        .limit(3);

      const recipients = (vets && vets.length > 0) ? vets.map(v => v.id) : ['prof-vet-1'];

      const notifInserts = recipients.map(recId => ({
        recipient_profile_id: recId,
        health_report_id: reportId,
        title: `URGENT: ${triageResult.riskLevel.toUpperCase()} Risk Alert - ${triageResult.primaryDisease.diseaseName}`,
        title_en: `URGENT: ${triageResult.riskLevel.toUpperCase()} Risk Alert - ${triageResult.primaryDisease.diseaseName}`,
        title_hi: `अति आवश्यक: ${triageResult.primaryDisease.diseaseNameHi} का अलर्ट`,
        title_mr: `तातडीचा इशारा: ${triageResult.primaryDisease.diseaseNameMr} चा संशय`,
        message: `Health report #${reportId.slice(0, 8)} on animal ${animalData?.tag_number || animal_id} flagged with ${triageResult.riskScore}/100 risk. Immediate veterinary inspection recommended.`,
        message_en: `Health report #${reportId.slice(0, 8)} on animal ${animalData?.tag_number || animal_id} flagged with ${triageResult.riskScore}/100 risk. Immediate veterinary inspection recommended.`,
        message_hi: `पशु ${animalData?.tag_number || animal_id} पर रिपोर्ट दर्ज। जोखिम स्तर: ${triageResult.riskScore}/100। तुरंत निरीक्षण करें।`,
        message_mr: `जनावर ${animalData?.tag_number || animal_id} वर अहवाल प्राप्त. जोखीम: ${triageResult.riskScore}/100. तातडीने तपासणी करा.`,
        notification_type: 'health_alert',
        is_read: false,
        language: 'en',
      }));

      await supabaseServer.from('notifications').insert(notifInserts);
    }

    // 4. Return complete Compound Triage Response
    return NextResponse.json({
      success: true,
      report: createdReport,
      assessment: assessmentRows?.[0] || null,
      riskAssessment: riskRows?.[0] || null,
      triage: triageResult,
    });
  } catch (err: any) {
    console.error('[API/Triage] Unhandled triage error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal triage service failure' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('report_id');
    const animalId = searchParams.get('animal_id');

    let query = supabaseServer
      .from('health_reports')
      .select(`
        *,
        animals(*),
        case_assessments(*),
        risk_assessments(*),
        health_report_diseases(*, disease_catalog(*)),
        diagnostic_samples(*)
      `);

    if (reportId) {
      query = query.eq('id', reportId);
    } else if (animalId) {
      query = query.eq('animal_id', animalId);
    } else {
      query = query.order('reported_at', { ascending: false }).limit(25);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch triage reports' }, { status: 500 });
  }
}
