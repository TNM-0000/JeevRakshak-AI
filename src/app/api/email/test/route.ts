import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '@/lib/notifications/notificationStore';
import { getEmailProvider } from '@/lib/notifications/mockProviders';
import { dataService } from '@/lib/supabase/dataService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email: explicitEmail } = body;

    let email = explicitEmail;
    if (!email && userId) {
      const profiles = await dataService.getAllProfiles();
      const user = profiles.find((p) => p.id === userId);
      email = user?.email;
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'No recipient email address registered or provided.' },
        { status: 400 }
      );
    }

    const provider = getEmailProvider();
    const subject = 'JeevRakshak Email notification test';
    const textContent = 'JeevRakshak Email notification test successful.';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669; margin-top: 0;">JeevRakshak AI</h2>
        <p style="font-size: 16px; color: #1e293b;">JeevRakshak Email notification test successful.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">This is a test notification generated from your JeevRakshak alert settings.</p>
      </div>
    `;

    const res = await provider.sendEmail(email, subject, htmlContent, textContent);

    const status = res.success ? 'SENT' : 'FAILED';
    await notificationStore.recordHistory({
      user_id: userId || 'test_user',
      notification_type: 'IMPORTANT_ANNOUNCEMENT',
      channel: 'email',
      subject,
      message: textContent,
      delivery_status: status,
      failure_reason: res.error,
      user_type: 'farmer',
      created_at: new Date().toISOString(),
      sent_at: res.success ? new Date().toISOString() : undefined,
    });

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || 'Email provider rejected delivery' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully.',
      messageId: res.messageId,
      provider: res.provider,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Exception during Email test dispatch' },
      { status: 500 }
    );
  }
}
