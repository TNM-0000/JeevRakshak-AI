// JeevRakshak AI - Pluggable Telegram & Email Delivery Providers
// Supports both zero-cost Simulation Mode (NOTIFICATION_MODE=mock) and Live Production Delivery (NOTIFICATION_MODE=production)

export interface SmsSendResult {
  success: boolean;
  messageId: string;
  provider: string;
  recipient: string;
  error?: string;
}

export interface TelegramSendResult {
  success: boolean;
  messageId: string;
  provider: string;
  chatId: string;
  error?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId: string;
  provider: string;
  recipient: string;
  subject: string;
  error?: string;
}

export interface ISmsProvider {
  name: string;
  sendSms(to: string, message: string): Promise<SmsSendResult>;
}

export interface ITelegramProvider {
  name: string;
  sendMessage(chatId: string, message: string, parseMode?: 'HTML' | 'Markdown'): Promise<TelegramSendResult>;
}

export interface IEmailProvider {
  name: string;
  sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailSendResult>;
}

// ==============================================================================
// 1. TELEGRAM BOT DELIVERY PROVIDERS
// ==============================================================================

/**
 * Mock / Simulated Telegram Bot Provider (NOTIFICATION_MODE=mock)
 * Produces clean ASCII terminal telemetry without incurring external network calls or costs.
 */
export class MockTelegramProvider implements ITelegramProvider {
  name = 'mock-telegram-bot';

  async sendMessage(chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<TelegramSendResult> {
    const messageId = `tg_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log('\n======================================================');
    console.log(`🤖 [MOCK TELEGRAM BOT DISPATCHED - SIMULATION MODE] at ${timestamp}`);
    console.log(`Telegram Chat ID: ${chatId}`);
    console.log(`Parse Mode      : ${parseMode}`);
    console.log(`Message Length  : ${message.length} chars`);
    console.log('------------------------------------------------------');
    console.log(`Content:\n${message}`);
    console.log('------------------------------------------------------');
    console.log('💡 [NOTE]: Running under NOTIFICATION_MODE=mock.');
    console.log('   To dispatch real Telegram messages to a phone:');
    console.log('   Set NOTIFICATION_MODE=production and TELEGRAM_BOT_TOKEN in .env.local');
    console.log('======================================================\n');

    return {
      success: true,
      messageId,
      provider: this.name,
      chatId,
    };
  }
}

/**
 * Live Telegram Bot API Provider (NOTIFICATION_MODE=production)
 * Directly interacts with Telegram Bot API endpoints and returns real provider errors.
 */
export class TelegramBotApiProvider implements ITelegramProvider {
  name = 'telegram-bot-api';
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  async sendMessage(chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<TelegramSendResult> {
    const timestamp = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    try {
      console.log(`[TelegramBotApi] Dispatching live message to Chat ID ${chatId} at ${timestamp}...`);
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
          disable_web_page_preview: true,
        }),
      });

      const data = await res.json();
      if (data && data.ok) {
        console.log(`[TelegramBotApi Success]: Message ${data.result?.message_id} sent to ${chatId}`);
        return {
          success: true,
          messageId: String(data.result?.message_id || Date.now()),
          provider: this.name,
          chatId,
        };
      }

      const errDesc = data?.description || 'Telegram API rejected the request';
      console.warn(`[TelegramBotApi Error]: ${errDesc}`, data);
      return {
        success: false,
        messageId: '',
        provider: this.name,
        chatId,
        error: errDesc,
      };
    } catch (err: any) {
      console.error('[TelegramBotApi Exception]:', err);
      return {
        success: false,
        messageId: '',
        provider: this.name,
        chatId,
        error: err.message || 'Network exception connecting to Telegram Bot API',
      };
    }
  }
}

// ==============================================================================
// 2. EMAIL DELIVERY PROVIDERS
// ==============================================================================

/**
 * Mock Email Provider (NOTIFICATION_MODE=mock)
 */
export class MockEmailProvider implements IEmailProvider {
  name = 'mock-email-smtp';

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailSendResult> {
    const messageId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log('\n======================================================');
    console.log(`📧 [MOCK EMAIL DISPATCHED - SIMULATION MODE] at ${timestamp}`);
    console.log(`Recipient Email : ${to}`);
    console.log(`Subject         : ${subject}`);
    console.log(`Preview         : ${text ? text.substring(0, 140) + '...' : 'HTML Body'}`);
    console.log('------------------------------------------------------');
    console.log('💡 [NOTE]: Running under NOTIFICATION_MODE=mock.');
    console.log('   To dispatch real emails to physical inbox:');
    console.log('   Set NOTIFICATION_MODE=production and RESEND_API_KEY in .env.local');
    console.log('======================================================\n');

    return {
      success: true,
      messageId,
      provider: this.name,
      recipient: to,
      subject,
    };
  }
}

/**
 * Resend Live Email Provider (https://resend.com)
 */
export class ResendEmailProvider implements IEmailProvider {
  name = 'resend';
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail?: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail || 'JeevRakshak AI <notifications@jeevrakshak.org>';
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailSendResult> {
    try {
      console.log(`[ResendEmailProvider] Sending live email to ${to} (${subject})...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject,
          html,
          text: text || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data && data.id) {
        return {
          success: true,
          messageId: data.id,
          provider: this.name,
          recipient: to,
          subject,
        };
      }

      const errMsg = data?.message || data?.error?.message || 'Resend rejected email';
      console.warn('[Resend Email Error]:', errMsg, data);
      return {
        success: false,
        messageId: '',
        provider: this.name,
        recipient: to,
        subject,
        error: errMsg,
      };
    } catch (err: any) {
      console.error('[Resend Email Exception]:', err);
      return {
        success: false,
        messageId: '',
        provider: this.name,
        recipient: to,
        subject,
        error: err.message || 'Network exception connecting to Resend API',
      };
    }
  }
}

/**
 * SendGrid Live Email Provider (https://sendgrid.com)
 */
export class SendGridEmailProvider implements IEmailProvider {
  name = 'sendgrid';
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail?: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail || 'notifications@jeevrakshak.org';
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailSendResult> {
    try {
      console.log(`[SendGridEmailProvider] Sending live email to ${to} (${subject})...`);
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: this.fromEmail, name: 'JeevRakshak AI' },
          subject,
          content: [
            { type: 'text/html', value: html },
            ...(text ? [{ type: 'text/plain', value: text }] : []),
          ],
        }),
      });

      if (res.ok) {
        return {
          success: true,
          messageId: `sg_${Date.now()}`,
          provider: this.name,
          recipient: to,
          subject,
        };
      }

      const data = await res.json().catch(() => ({}));
      const errMsg = data?.errors?.[0]?.message || `SendGrid returned status ${res.status}`;
      return {
        success: false,
        messageId: '',
        provider: this.name,
        recipient: to,
        subject,
        error: errMsg,
      };
    } catch (err: any) {
      return {
        success: false,
        messageId: '',
        provider: this.name,
        recipient: to,
        subject,
        error: err.message || 'Network exception connecting to SendGrid API',
      };
    }
  }
}

// ==============================================================================
// 3. SMS PROVIDERS (LEGACY / OPTIONAL)
// ==============================================================================

export class MockSmsProvider implements ISmsProvider {
  name = 'mock-sms-gateway';

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      messageId,
      provider: this.name,
      recipient: to,
    };
  }
}

export class Fast2SmsProvider implements ISmsProvider {
  name = 'fast2sms';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const cleanNumber = to.replace(/[^0-9]/g, '').slice(-10);
    if (cleanNumber.length !== 10) {
      return {
        success: false,
        messageId: '',
        provider: this.name,
        recipient: to,
        error: 'Invalid 10-digit Indian phone number',
      };
    }

    try {
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanNumber,
        }),
      });

      const data = await res.json();
      if (data && data.return === true) {
        return {
          success: true,
          messageId: data.request_id || `f2s_${Date.now()}`,
          provider: this.name,
          recipient: cleanNumber,
        };
      } else {
        return {
          success: false,
          messageId: '',
          provider: this.name,
          recipient: cleanNumber,
          error: (data && data.message && data.message[0]) || 'Fast2SMS Gateway dispatch failed',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        messageId: '',
        provider: this.name,
        recipient: cleanNumber,
        error: err.message,
      };
    }
  }
}

export class TwilioSmsProvider implements ISmsProvider {
  name = 'twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const formattedTo = to.startsWith('+') ? to : `+91${to.replace(/[^0-9]/g, '').slice(-10)}`;
    try {
      const authHeader = 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const params = new URLSearchParams({
        To: formattedTo,
        From: this.fromNumber,
        Body: message,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await res.json();
      if (res.ok && data.sid) {
        return {
          success: true,
          messageId: data.sid,
          provider: this.name,
          recipient: formattedTo,
        };
      } else {
        return {
          success: false,
          messageId: '',
          provider: this.name,
          recipient: formattedTo,
          error: data.message || 'Twilio dispatch failed',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        messageId: '',
        provider: this.name,
        recipient: formattedTo,
        error: err.message,
      };
    }
  }
}

// ==============================================================================
// 4. FACTORY PROVIDER RESOLVERS (HONORS NOTIFICATION_MODE)
// ==============================================================================

/**
 * Returns the Telegram provider according to NOTIFICATION_MODE
 */
export function getTelegramProvider(): ITelegramProvider {
  const mode = (process.env.NOTIFICATION_MODE || 'mock').trim().toLowerCase();
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (mode === 'production') {
    if (token) {
      return new TelegramBotApiProvider(token);
    }
    // Return a dummy provider that returns a clear configuration error
    return {
      name: 'unconfigured-telegram',
      async sendMessage(chatId: string) {
        return {
          success: false,
          messageId: '',
          provider: 'telegram-bot-api',
          chatId,
          error: 'TELEGRAM_BOT_TOKEN is not configured in .env.local (required in production mode)',
        };
      },
    };
  }

  // Default: Mock Telegram Provider (safe, zero-cost, console logged)
  return new MockTelegramProvider();
}

/**
 * Returns the Email provider according to NOTIFICATION_MODE
 */
export function getEmailProvider(): IEmailProvider {
  const mode = (process.env.NOTIFICATION_MODE || 'mock').trim().toLowerCase();
  const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (mode === 'production') {
    if (resendKey) {
      return new ResendEmailProvider(resendKey, fromEmail);
    }
    if (sendgridKey) {
      return new SendGridEmailProvider(sendgridKey, fromEmail);
    }
    // Return a provider that yields a clear configuration error
    return {
      name: 'unconfigured-email',
      async sendEmail(to: string, subject: string) {
        return {
          success: false,
          messageId: '',
          provider: 'email-provider',
          recipient: to,
          subject,
          error: 'No email API key configured (RESEND_API_KEY or SENDGRID_API_KEY missing in .env.local for production mode)',
        };
      },
    };
  }

  // Default: Mock Email Provider (safe, zero-cost, console logged)
  return new MockEmailProvider();
}

/**
 * Returns the SMS provider according to environment
 */
export function getSmsProvider(): ISmsProvider {
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey) {
    return new Fast2SmsProvider(fast2SmsKey);
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioAuth && twilioFrom) {
    return new TwilioSmsProvider(twilioSid, twilioAuth, twilioFrom);
  }

  return new MockSmsProvider();
}
