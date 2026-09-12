import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const preferences = notificationService.getPreferences(userId);
    return NextResponse.json({ success: true, preferences });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || body.user_id;
    const updates = body.updates || body.preferences || {};

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const preferences = await notificationService.updatePreferences(userId, updates);
    return NextResponse.json({ success: true, preferences });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update preferences' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

