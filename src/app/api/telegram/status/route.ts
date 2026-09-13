import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/lib/supabase/dataService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId query parameter' }, { status: 400 });
    }

    const connection = await dataService.getTelegramConnection(userId);

    return NextResponse.json({
      success: true,
      connected: !!connection && connection.status === 'connected',
      connection: connection || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch status' }, { status: 500 });
  }
}
