import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      title_en,
      title_hi,
      title_mr,
      message,
      message_en,
      message_hi,
      message_mr,
      language = 'en',
      created_by = 'prof-gov-1',
      health_report_id = null,
    } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'title and message are required to issue an advisory.' }, { status: 400 });
    }

    // 1. Insert advisory record
    const { data: advisoryRows, error: insertError } = await supabaseServer
      .from('health_advisories')
      .insert([
        {
          title,
          title_en: title_en || title,
          title_hi: title_hi || title,
          title_mr: title_mr || title,
          message,
          message_en: message_en || message,
          message_hi: message_hi || message,
          message_mr: message_mr || message,
          language,
          created_by,
          health_report_id,
        },
      ])
      .select();

    if (insertError || !advisoryRows || advisoryRows.length === 0) {
      return NextResponse.json({ error: insertError?.message || 'Advisory insert failed' }, { status: 500 });
    }

    const createdAdvisory = advisoryRows[0];

    // 2. Broadcast notifications to livestock owners & veterinarians
    const { data: profiles } = await supabaseServer
      .from('profiles')
      .select('id, role')
      .limit(100);

    if (profiles && profiles.length > 0) {
      const notifications = profiles.map(p => ({
        recipient_profile_id: p.id,
        title: title_en || title,
        title_en: title_en || title,
        title_hi: title_hi || title,
        title_mr: title_mr || title,
        message: message_en || message,
        message_en: message_en || message,
        message_hi: message_hi || message,
        message_mr: message_mr || message,
        notification_type: 'advisory',
        is_read: false,
        language,
      }));

      await supabaseServer.from('notifications').insert(notifications);
    }

    return NextResponse.json({
      success: true,
      advisory: createdAdvisory,
      broadcastCount: profiles?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Advisory service error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const { data, error } = await supabaseServer
      .from('health_advisories')
      .select('*, profiles(full_name, role)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch advisories' }, { status: 500 });
  }
}
