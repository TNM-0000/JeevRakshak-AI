import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jylsaljthenattjwufqk.supabase.co';
// Use service_role key if available for full RLS bypass, otherwise anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_JSbqJv3bT5Y17REjyztQ5w_yfYPKP2t';

const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { table, action, payload, filters } = body;

    if (!table) {
      return NextResponse.json({ error: 'Missing table name' }, { status: 400 });
    }

    if (action === 'insert') {
      const { data, error } = await supabaseServer.from(table).insert(payload).select();
      if (error) {
        return NextResponse.json({ error: error.message, details: error }, { status: 400 });
      }
      return NextResponse.json({ data });
    }

    if (action === 'select') {
      let query = supabaseServer.from(table).select(payload?.select || '*');
      if (filters && typeof filters === 'object') {
        for (const [key, val] of Object.entries(filters)) {
          query = query.eq(key, val);
        }
      }
      const { data, error } = await query;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ data });
    }

    if (action === 'update') {
      let query = supabaseServer.from(table).update(payload);
      if (filters && typeof filters === 'object') {
        for (const [key, val] of Object.entries(filters)) {
          query = query.eq(key, val);
        }
      }
      const { data, error } = await query.select();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Test if write is permitted on administrative_locations
  const { data: testData, error: testError } = await supabaseServer
    .from('administrative_locations')
    .insert([{ name: '__connectivity_test__', level: 'district' }])
    .select();

  let rlsBlocked = false;
  let writePermitted = false;

  if (testError) {
    if (testError.code === '42501') {
      rlsBlocked = true;
    }
  } else if (testData && testData[0]) {
    writePermitted = true;
    // Clean up test row
    await supabaseServer.from('administrative_locations').delete().eq('id', testData[0].id);
  }

  return NextResponse.json({
    supabaseUrl,
    hasServiceRoleKey: hasServiceRole,
    writePermitted,
    rlsBlocked,
    error: testError ? { code: testError.code, message: testError.message } : null,
    instruction: rlsBlocked
      ? 'PostgreSQL Row Level Security (RLS) is blocking inserts with error 42501.'
      : 'Supabase database is connected and writes are active!',
  });
}
