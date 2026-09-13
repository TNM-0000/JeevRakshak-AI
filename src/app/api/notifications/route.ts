import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { DispatchNotificationParams, NotificationType } from '@/types/notificationSystem';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const channel = (searchParams.get('channel') as any) || undefined;
    const type = (searchParams.get('type') as any) || undefined;

    const history = notificationService.getHistory({ userId, channel, type });

    return NextResponse.json({
      success: true,
      total: history.length,
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DispatchNotificationParams;

    if (!body.type || !body.userId || !body.userName) {
      return NextResponse.json(
        { error: 'Missing required parameters: type, userId, and userName are required' },
        { status: 400 }
      );
    }

    const result = await notificationService.dispatch(body);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to dispatch notification' }, { status: 500 });
  }
}
