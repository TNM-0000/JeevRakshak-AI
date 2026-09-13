import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/lib/supabase/dataService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const disconnected = await dataService.disconnectTelegram(userId);

    return NextResponse.json({
      success: true,
      disconnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to disconnect Telegram' }, { status: 500 });
  }
}
