import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '@/lib/notifications/notificationStore';
import { getTelegramProvider } from '@/lib/notifications/mockProviders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, chatId: explicitChatId } = body;

    let chatId = explicitChatId;
    if (!chatId && userId) {
      const conn = await notificationStore.getTelegramConnection(userId);
      if (conn && conn.status === 'connected') {
        chatId = conn.telegram_chat_id;
      }
    }

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Telegram account not connected. Please connect your Telegram account first.' },
        { status: 400 }
      );
    }

    const provider = getTelegramProvider();
    const testMessage = 'JeevRakshak Telegram notification test successful.';
    const res = await provider.sendMessage(chatId, testMessage, 'HTML');

    const status = res.success ? 'SENT' : 'FAILED';
    await notificationStore.recordHistory({
      user_id: userId || 'test_user',
      notification_type: 'IMPORTANT_ANNOUNCEMENT',
      channel: 'telegram',
      message: testMessage,
      delivery_status: status,
      failure_reason: res.error,
      user_type: 'farmer',
      created_at: new Date().toISOString(),
      sent_at: res.success ? new Date().toISOString() : undefined,
    });

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || 'Telegram API request failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram message sent successfully.',
      messageId: res.messageId,
      provider: res.provider,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Exception during Telegram test dispatch' },
      { status: 500 }
    );
  }
}
