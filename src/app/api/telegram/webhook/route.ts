import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/lib/supabase/dataService';
import { getTelegramProvider } from '@/lib/notifications/mockProviders';
import { notificationService } from '@/lib/notifications/notificationService';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Telegram Bot Update payload structure
    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text.trim();
    const username = message.from?.username || undefined;
    const firstName = message.from?.first_name || undefined;
    const provider = getTelegramProvider();

    // 1. Handle /start command (with or without linking token)
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const token = parts.length > 1 ? parts[1].trim() : '';

      if (token) {
        // User clicked deep link: /start link_...
        const res = await dataService.verifyTelegramLinkingToken(token, chatId, username, firstName);

        if (res.success && res.connection) {
          const reply = `✅ <b>Welcome to JeevRakshak!</b>\n\nYour Telegram account has been successfully connected.\n\nYou can now receive:\n• Vaccination reminders\n• Regional disease alerts\n• Important animal-health notifications\n\nYou can manage your notification preferences from the JeevRakshak platform anytime.\n\nType /status to view connection status or /help for guidance.`;
          await provider.sendMessage(chatId, reply, 'HTML');

          // Dispatch TELEGRAM_CONNECTED event for audit log
          const userProfile = (await dataService.getAllProfiles()).find((p) => p.id === res.connection!.user_id);
          if (userProfile) {
            notificationService.dispatch({
              type: 'TELEGRAM_CONNECTED',
              userId: userProfile.id,
              userName: userProfile.full_name,
              userEmail: userProfile.email,
              userTelegramChatId: chatId,
              userRole: (userProfile as any).role || 'farmer',
              region: userProfile.district || 'Maharashtra',
              relatedEventId: `tg_linked_${res.connection.id}`,
              preferredChannels: ['telegram', 'email'],
              variables: {
                user_name: userProfile.full_name,
                region: userProfile.district || 'Maharashtra',
              },
            }).catch((e) => console.warn('[TelegramConnected Dispatch Error]:', e));
          }

          return NextResponse.json({ ok: true, linked: true });
        } else {
          const reply = `⚠️ <b>Linking Failed</b>\n\n${res.error || 'The linking link has expired or is invalid.'}\n\nPlease click <b>"Connect Telegram"</b> in your JeevRakshak dashboard to generate a fresh link.`;
          await provider.sendMessage(chatId, reply, 'HTML');
          return NextResponse.json({ ok: true, linked: false });
        }
      } else {
        // Plain /start without token
        const existing = await dataService.getTelegramConnectionByChatId(chatId);
        if (existing) {
          const reply = `👋 <b>Hello!</b>\n\nYour Telegram account is already connected to JeevRakshak AI.\n\nUse:\n• /status - Check active notification streams\n• /settings - Notification management\n• /unlink - Disconnect this Telegram account\n• /help - Help information`;
          await provider.sendMessage(chatId, reply, 'HTML');
        } else {
          const reply = `👋 <b>Welcome to JeevRakshak AI Bot!</b>\n\nTo link this Telegram account with your JeevRakshak profile:\n1. Log in to your JeevRakshak dashboard.\n2. Open <b>Alerts & Telegram Preferences</b>.\n3. Click <b>"Connect Telegram"</b> and tap the generated link.\n\nOnce linked, you will receive timely animal-health reminders and disease containment advisories.`;
          await provider.sendMessage(chatId, reply, 'HTML');
        }
        return NextResponse.json({ ok: true });
      }
    }

    // 2. Handle /status command
    if (text === '/status') {
      const existing = await dataService.getTelegramConnectionByChatId(chatId);
      if (existing) {
        const reply = `📋 <b>Connection Status: CONNECTED</b>\n\nYour JeevRakshak Telegram account is active.\n\nYou are currently receiving:\n✓ Vaccination reminders & countdowns\n✓ Regional disease alerts\n✓ Seasonal advisories & campaign drives\n\nTo manage specific categories, open your JeevRakshak web dashboard.`;
        await provider.sendMessage(chatId, reply, 'HTML');
      } else {
        const reply = `ℹ️ <b>Status: NOT CONNECTED</b>\n\nThis Telegram account is not yet linked to a JeevRakshak profile. Click <b>"Connect Telegram"</b> on your web dashboard to link.`;
        await provider.sendMessage(chatId, reply, 'HTML');
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Handle /settings command
    if (text === '/settings') {
      const reply = `⚙️ <b>Notification Settings</b>\n\nYou can configure channels and topics from your JeevRakshak dashboard:\n• Vaccination Reminders\n• Regional Disease Alerts\n• Seasonal Advisories\n• Vaccination Campaigns\n\n👉 Open portal: <a href="https://jeevrakshak.org">jeevrakshak.org</a>`;
      await provider.sendMessage(chatId, reply, 'HTML');
      return NextResponse.json({ ok: true });
    }

    // 4. Handle /unlink command
    if (text === '/unlink') {
      const existing = await dataService.getTelegramConnectionByChatId(chatId);
      if (existing) {
        await dataService.disconnectTelegram(existing.user_id);
        const reply = `🔌 <b>Disconnected</b>\n\nYour Telegram account has been disconnected from JeevRakshak AI. You will no longer receive animal-health notifications on Telegram.\n\nYou can reconnect anytime from the dashboard.`;
        await provider.sendMessage(chatId, reply, 'HTML');
      } else {
        const reply = `ℹ️ This Telegram account is not currently connected.`;
        await provider.sendMessage(chatId, reply, 'HTML');
      }
      return NextResponse.json({ ok: true });
    }

    // 5. Handle /help command
    if (text === '/help') {
      const reply = `🤖 <b>JeevRakshak AI Bot Commands</b>\n\n• /status - Check connection status\n• /settings - View settings guidance\n• /unlink - Disconnect Telegram alerts\n• /help - Show this command list\n\n📞 Emergency Veterinary Helpline: <b>1962</b>`;
      await provider.sendMessage(chatId, reply, 'HTML');
      return NextResponse.json({ ok: true });
    }

    // Default response for unhandled text
    const defaultReply = `🤖 I am the <b>JeevRakshak AI Health Bot</b>. Type /help to see available commands or open your JeevRakshak dashboard to manage alerts.`;
    await provider.sendMessage(chatId, defaultReply, 'HTML');

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[TelegramWebhook Error]:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
