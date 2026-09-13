import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/lib/supabase/dataService';
import { notificationService } from '@/lib/notifications/notificationService';
import { getTelegramProvider } from '@/lib/notifications/mockProviders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, chatId, username, firstName } = body;

    if (!token || !chatId) {
      return NextResponse.json({ error: 'Missing token or chatId parameter' }, { status: 400 });
    }

    const res = await dataService.verifyTelegramLinkingToken(token, String(chatId), username, firstName);

    if (!res.success || !res.connection) {
      return NextResponse.json({ error: res.error || 'Failed to verify token' }, { status: 400 });
    }

    // Send confirmation message to the Telegram chat
    const telegramProvider = getTelegramProvider();
    const welcomeMsg = `✅ <b>Welcome to JeevRakshak!</b>\n\nYour Telegram account has been successfully connected.\n\nYou can now receive:\n• Vaccination reminders\n• Regional disease alerts\n• Important animal-health notifications\n\nYou can manage your notification preferences from the JeevRakshak platform anytime.`;

    await telegramProvider.sendMessage(String(chatId), welcomeMsg, 'HTML');

    // Also dispatch TELEGRAM_CONNECTED event through notificationService for audit log
    const userProfile = (await dataService.getAllProfiles()).find((p) => p.id === res.connection!.user_id);
    if (userProfile) {
      notificationService.dispatch({
        type: 'TELEGRAM_CONNECTED',
        userId: userProfile.id,
        userName: userProfile.full_name,
        userEmail: userProfile.email,
        userTelegramChatId: String(chatId),
        userRole: (userProfile as any).role || 'farmer',
        region: userProfile.district || 'Maharashtra',
        relatedEventId: `tg_linked_${res.connection.id}`,
        preferredChannels: ['telegram', 'email'],
        variables: {
          user_name: userProfile.full_name,
          region: userProfile.district || 'Maharashtra',
        },
      }).catch((e) => console.warn('[TelegramConnected Notification Dispatch]:', e));
    }

    return NextResponse.json({
      success: true,
      connection: res.connection,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
