import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      health_report_id,
      sample_type,
      sample_type_en,
      sample_type_hi,
      sample_type_mr,
      notes,
      notes_en,
      notes_hi,
      notes_mr,
    } = body;

    if (!health_report_id || !sample_type) {
      return NextResponse.json(
        { error: 'health_report_id and sample_type are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('diagnostic_samples')
      .insert([
        {
          health_report_id,
          sample_type,
          sample_type_en: sample_type_en || sample_type,
          sample_type_hi: sample_type_hi || sample_type,
          sample_type_mr: sample_type_mr || sample_type,
          status: 'collected',
          collected_at: new Date().toISOString(),
          notes: notes || '',
          notes_en: notes_en || notes || '',
          notes_hi: notes_hi || notes || '',
          notes_mr: notes_mr || notes || '',
        },
      ])
      .select();

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: error?.message || 'Failed to create sample' }, { status: 500 });
    }

    return NextResponse.json({ success: true, sample: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sample creation error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, result, result_en, result_hi, result_mr, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing sample id' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (result !== undefined) {
      updates.result = result;
      updates.result_en = result_en || result;
      updates.result_hi = result_hi || result;
      updates.result_mr = result_mr || result;
    }
    if (notes !== undefined) updates.notes = notes;

    const now = new Date().toISOString();
    if (status === 'sent') updates.sent_at = now;
    if (status === 'received') updates.received_at = now;
    if (status === 'tested') updates.tested_at = now;

    const { data: updatedSample, error: updateError } = await supabaseServer
      .from('diagnostic_samples')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError || !updatedSample) {
      return NextResponse.json({ error: updateError?.message || 'Failed to update sample' }, { status: 500 });
    }

    // If lab test is completed and conclusive, update linked case_assessment
    if (status === 'tested' && result && updatedSample.health_report_id) {
      const isPositive = result.toLowerCase().includes('positive') || result.toLowerCase().includes('detected');
      const newStatus = isPositive ? 'confirmed' : 'ruled_out';

      await supabaseServer
        .from('case_assessments')
        .update({
          status: newStatus,
          assessment_notes: `Lab test result recorded: ${result}. Assessment finalized as ${newStatus}.`,
          assessed_at: now,
        })
        .eq('health_report_id', updatedSample.health_report_id);
    }

    return NextResponse.json({ success: true, sample: updatedSample });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sample update error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('health_report_id');
    const sampleId = searchParams.get('id');

    let query = supabaseServer.from('diagnostic_samples').select('*').order('collected_at', { ascending: false });

    if (sampleId) {
      query = query.eq('id', sampleId);
    } else if (reportId) {
      query = query.eq('health_report_id', reportId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch samples' }, { status: 500 });
  }
}
