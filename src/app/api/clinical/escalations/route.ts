import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      health_report_id,
      escalated_to = 'District Animal Husbandry Officer (DAHO)',
      reason,
      reason_en,
      reason_hi,
      reason_mr,
    } = body;

    if (!health_report_id || !reason) {
      return NextResponse.json(
        { error: 'health_report_id and reason are required to escalate case.' },
        { status: 400 }
      );
    }

    const { data: escalationRows, error: insertError } = await supabaseServer
      .from('case_escalations')
      .insert([
        {
          health_report_id,
          escalated_to,
          reason,
          reason_en: reason_en || reason,
          reason_hi: reason_hi || reason,
          reason_mr: reason_mr || reason,
          status: 'open',
        },
      ])
      .select();

    if (insertError || !escalationRows || escalationRows.length === 0) {
      return NextResponse.json({ error: insertError?.message || 'Escalation insert failed' }, { status: 500 });
    }

    const escalation = escalationRows[0];

    // Notify government officials
    const { data: govtProfiles } = await supabaseServer
      .from('profiles')
      .select('id')
      .eq('role', 'government')
      .limit(5);

    const recipients = (govtProfiles && govtProfiles.length > 0) ? govtProfiles.map(g => g.id) : ['prof-gov-1'];

    const notifs = recipients.map(recId => ({
      recipient_profile_id: recId,
      health_report_id,
      title: `URGENT CASE ESCALATION: Report #${health_report_id.slice(0, 8)}`,
      title_en: `URGENT CASE ESCALATION: Report #${health_report_id.slice(0, 8)}`,
      title_hi: `गंभीर मामला अग्रेषित: रिपोर्ट #${health_report_id.slice(0, 8)}`,
      title_mr: `तातडीचे प्रकरण वर्ग: अहवाल #${health_report_id.slice(0, 8)}`,
      message: `Case escalated to ${escalated_to}. Reason: ${reason}`,
      message_en: `Case escalated to ${escalated_to}. Reason: ${reason}`,
      message_hi: `मामला ${escalated_to} को अग्रेषित किया गया। कारण: ${reason}`,
      message_mr: `प्रकरण ${escalated_to} यांच्याकडे वर्ग केले. कारण: ${reason}`,
      notification_type: 'escalation',
      is_read: false,
      language: 'en',
    }));

    await supabaseServer.from('notifications').insert(notifs);

    return NextResponse.json({ success: true, escalation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Escalation service error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing escalation id or status' }, { status: 400 });
    }

    const updates: Record<string, any> = { status };
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabaseServer
      .from('case_escalations')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, escalation: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Escalation update error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('health_report_id');

    let query = supabaseServer
      .from('case_escalations')
      .select('*, health_reports(*, animals(*))')
      .order('created_at', { ascending: false });

    if (reportId) {
      query = query.eq('health_report_id', reportId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch escalations' }, { status: 500 });
  }
}
