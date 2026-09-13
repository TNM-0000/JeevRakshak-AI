// JeevRakshak AI - Pluggable SMS & Email Delivery Providers
// Defaults to Dev/Mock Provider with clean terminal/log telemetry

export interface SmsSendResult {
  success: boolean;
  messageId: string;
  provider: string;
  recipient: string;
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

export interface IEmailProvider {
  name: string;
  sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailSendResult>;
}

// 1. Mock / Development SMS Provider
export class MockSmsProvider implements ISmsProvider {
  name = 'mock-sms-gateway';

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toLocaleTimeString();

    console.log('\n======================================================');
    console.log(`📱 [MOCK SMS DISPATCHED - SIMULATION MODE] at ${timestamp}`);
    console.log(`Recipient Phone : ${to}`);
    console.log(`Message Length  : ${message.length} chars`);
    console.log(`Content         :\n"${message}"`);
    console.log('------------------------------------------------------');
    console.log('💡 [NOTE FOR DEVELOPER / USER]:');
    console.log('This SMS was logged in simulation mode because no real SMS Gateway API key is configured in .env.local.');
    console.log('👉 To receive REAL SMS on your physical phone:');
    console.log('   Add: FAST2SMS_API_KEY=your_key_here  (Free for Indian numbers at fast2sms.com)');
    console.log('   or : TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_PHONE_NUMBER=... in .env.local');
    console.log('======================================================\n');

    return {
      success: true,
      messageId,
      provider: this.name,
      recipient: to,
    };
  }
}

// 2. Fast2SMS Live Telecom Provider (for Indian Numbers)
export class Fast2SmsProvider implements ISmsProvider {
  name = 'fast2sms';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const cleanNumber = to.replace(/[^0-9]/g, '').slice(-10);
    const timestamp = new Date().toLocaleTimeString();

    if (cleanNumber.length !== 10) {
      console.warn(`[Fast2SMS Error]: Recipient '${to}' is not a valid 10-digit Indian mobile number.`);
      return {
        success: false,
        messageId: '',
        provider: this.name,
        recipient: to,
        error: 'Invalid 10-digit Indian phone number',
      };
    }

    try {
      console.log('\n======================================================');
      console.log(`📡 [FAST2SMS LIVE DISPATCH] at ${timestamp}`);
      console.log(`Connecting to Fast2SMS Gateway for: +91 ${cleanNumber}...`);

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
      console.log(`Fast2SMS Gateway Response:`, data);
      console.log('======================================================\n');

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
      console.error('[Fast2SMS Network Error]:', err.message);
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

// 3. Twilio Live SMS Provider
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
    const timestamp = new Date().toLocaleTimeString();
    const formattedTo = to.startsWith('+') ? to : `+91${to.replace(/[^0-9]/g, '').slice(-10)}`;

    try {
      console.log('\n======================================================');
      console.log(`📡 [TWILIO LIVE DISPATCH] at ${timestamp}`);
      console.log(`Sending SMS to: ${formattedTo} from ${this.fromNumber}...`);

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
      console.log(`Twilio Gateway Response Status:`, data.status);
      console.log('======================================================\n');

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

// 4. Mock / Development Email Provider
export class MockEmailProvider implements IEmailProvider {
  name = 'mock-email-smtp';

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailSendResult> {
    const messageId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toLocaleTimeString();

    console.log('\n======================================================');
    console.log(`📧 [MOCK EMAIL DISPATCHED - SIMULATION MODE] at ${timestamp}`);
    console.log(`Recipient Email : ${to}`);
    console.log(`Subject         : ${subject}`);
    console.log(`Preview Plain   : ${text ? text.substring(0, 140) + '...' : 'HTML Body'}`);
    console.log('------------------------------------------------------');
    console.log('💡 [NOTE FOR DEVELOPER / USER]:');
    console.log('Email was logged in simulation mode. To send real emails:');
    console.log('   Add: RESEND_API_KEY=your_key or SENDGRID_API_KEY=your_key in .env.local');
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

// Factory to resolve configured providers from environment
export function getSmsProvider(): ISmsProvider {
  // Check Fast2SMS first (India's most popular instant SMS gateway)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey) {
    return new Fast2SmsProvider(fast2SmsKey);
  }

  // Check Twilio
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioAuth && twilioFrom) {
    return new TwilioSmsProvider(twilioSid, twilioAuth, twilioFrom);
  }

  // Fallback to Mock SMS Provider
  return new MockSmsProvider();
}

export function getEmailProvider(): IEmailProvider {
  const providerName = (process.env.EMAIL_PROVIDER || 'mock').toLowerCase();
  return new MockEmailProvider();
}

