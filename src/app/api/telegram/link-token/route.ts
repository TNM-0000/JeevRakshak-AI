import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/lib/supabase/dataService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const token = await dataService.createTelegramLinkingToken(userId);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'JeevRakshakBot';
    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({
      success: true,
      token,
      botUsername,
      deepLink,
      expiresInMinutes: 15,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate linking token' }, { status: 500 });
  }
}
