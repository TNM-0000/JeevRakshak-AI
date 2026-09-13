// JeevRakshak AI - Notification Templates & Variable Interpolator
// Strictly supports official SIH event types (Telegram & Email, No OTPs)

import {
  NotificationType,
  NotificationTemplateVariables,
} from '@/types/notificationSystem';

export interface RenderedMessage {
  subject?: string;
  telegramContent: string;
  smsContent: string; // legacy fallback
  emailText: string;
  emailHtml: string;
}

export function interpolateTemplate(template: string, vars: NotificationTemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = (vars as any)[key];
    return val !== undefined && val !== null ? String(val) : '';
  });
}

export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  {
    subject: string;
    telegram: string;
    sms: string;
    emailHeadline: string;
    emailBody: string;
  }
> = {
  ACCOUNT_CREATED: {
    subject: 'Welcome to JeevRakshak – Account Successfully Created',
    telegram: `🎉 <b>Welcome to JeevRakshak!</b>\n\nYour <b>{{user_role}}</b> account has been successfully created, {{user_name}}.\n\nYou can use JeevRakshak to manage animal-health information and receive vaccination reminders and regional disease alerts.\n\n📍 Region: <b>{{region}}</b>\n📞 Emergency Vet Line: <b>1962</b>`,
    sms: 'Welcome to JeevRakshak, {{user_name}}. Your {{user_role}} account has been created successfully. You can now use the platform to manage animal health records and receive important regional alerts. Helpline: 1962.',
    emailHeadline: 'Welcome to JeevRakshak AI Livestock Health Network',
    emailBody: `Dear {{user_name}},<br><br>
Your <strong>{{user_role}}</strong> account has been registered successfully on JeevRakshak AI, the Maharashtra State Livestock Disease Surveillance & Management System.<br><br>
<strong>Key Features Available:</strong><br>
• Real-time regional disease outbreak alerts for your area (District / Taluka / Village).<br>
• Automated vaccination reminder schedule with booster countdowns.<br>
• Instant AI symptom check and triage verification.<br>
• Direct connection to local veterinary polyclinics and emergency 1962 mobile units.<br><br>
For assistance, contact your local veterinary dispensary or call Toll-Free Helpline: <strong>1962</strong>.`,
  },

  FIRST_LOGIN: {
    subject: 'JeevRakshak – Successful Login Notification',
    telegram: `🔐 <b>JeevRakshak AI — Login Notification</b>\n\nHello <b>{{user_name}}</b>, your account was successfully logged in.\n\n📍 Monitored Region: <b>{{region}}</b>\n🛡️ Role: <b>{{user_role}}</b>\n🕒 Login Time: <b>{{due_date}}</b>\n\nYou will receive timely vaccination reminders and regional disease outbreak advisories directly in this chat.`,
    sms: 'Welcome to JeevRakshak, {{user_name}}. You have successfully logged in. Access your animal health info and alerts anytime.',
    emailHeadline: 'Login Notification – JeevRakshak AI',
    emailBody: `Dear {{user_name}},<br><br>
You have successfully signed in to JeevRakshak AI as <strong>{{user_role}}</strong>.<br><br>
Region: <strong>{{region}}</strong>.<br><br>
Automated biosecurity notices and vaccination reminders will be dispatched directly to your Telegram and Email.`,
  },

  TELEGRAM_CONNECTED: {
    subject: 'JeevRakshak Telegram Notifications Connected',
    telegram: `✅ <b>Welcome to JeevRakshak!</b>\n\nYour Telegram account has been successfully connected.\n\nYou can now receive:\n• Vaccination reminders\n• Regional disease alerts\n• Important animal-health notifications\n\nYou can manage your notification preferences from the JeevRakshak platform anytime.`,
    sms: 'Your JeevRakshak Telegram channel has been successfully connected. You will now receive instant animal-health and disease alerts.',
    emailHeadline: 'Telegram Notifications Successfully Connected',
    emailBody: `Dear {{user_name}},<br><br>
Your Telegram account has been linked to JeevRakshak AI.<br><br>
You will now receive instant animal-health notifications, disease outbreak alerts, and vaccination schedule countdowns directly on Telegram.`,
  },

  VACCINATION_UPCOMING: {
    subject: 'Upcoming Vaccination Reminder: {{animal_tag}} ({{vaccine_name}})',
    telegram: `🐄 <b>Vaccination Reminder</b>\n\n<b>Animal:</b> {{animal_tag}} ({{animal_type}})\n<b>Vaccine:</b> {{vaccine_name}}\n<b>Due Date:</b> {{due_date}}\n\nPlease contact your veterinarian or authorized veterinary dispensary before the scheduled date.`,
    sms: 'Vaccination Reminder: Your animal {{animal_tag}} ({{animal_type}}) is due for {{vaccine_name}} vaccination on {{due_date}}. Please contact your local veterinarian or veterinary center.',
    emailHeadline: 'Upcoming Vaccination Schedule',
    emailBody: `Dear {{farmer_name}},<br><br>
This is an automated reminder that your animal <strong>{{animal_tag}}</strong> ({{animal_type}}) is scheduled for the <strong>{{vaccine_name}}</strong> vaccination on <strong>{{due_date}}</strong>.<br><br>
<strong>Recommended Action:</strong><br>
{{recommended_action}}<br><br>
Please arrange with your designated veterinary dispensary or registered field veterinarian before the scheduled date.`,
  },

  VACCINATION_DUE: {
    subject: 'Action Required: Vaccination Due Today for {{animal_tag}}',
    telegram: `⚠️ <b>URGENT: Vaccination Due Today</b>\n\n<b>Animal:</b> {{animal_tag}} ({{animal_type}})\n<b>Vaccine:</b> {{vaccine_name}}\n<b>Due Date:</b> TODAY ({{due_date}})\n\nTimely immunization under NADCP is vital to safeguard your herd against contagion.`,
    sms: 'URGENT VACCINATION DUE: Your animal {{animal_tag}} is due for {{vaccine_name}} TODAY ({{due_date}}). Ensure vaccination to prevent contagious infection.',
    emailHeadline: 'Vaccination Due Today – Action Required',
    emailBody: `Dear {{farmer_name}},<br><br>
Your animal <strong>{{animal_tag}}</strong> ({{animal_type}}) is due for <strong>{{vaccine_name}}</strong> today ({{due_date}}).<br><br>
Timely vaccination under the National Animal Disease Control Programme (NADCP) is critical to safeguard your livestock against preventable outbreaks.<br><br>
<strong>Veterinary Contact:</strong> {{contact_information}}`,
  },

  VACCINATION_OVERDUE: {
    subject: 'CRITICAL ALERT: Overdue Vaccination for {{animal_tag}}',
    telegram: `🚨 <b>OVERDUE VACCINATION ALERT</b>\n\n<b>Animal:</b> {{animal_tag}} ({{animal_type}})\n<b>Vaccine:</b> {{vaccine_name}}\n<b>Status:</b> Overdue by {{overdue_days}} days\n\nImmediate veterinary intervention required to prevent disease transmission across your herd.`,
    sms: 'CRITICAL: {{vaccine_name}} for {{animal_tag}} is OVERDUE by {{overdue_days}} days. High contagion risk. Contact local vet dispensary immediately.',
    emailHeadline: 'Critical Warning: Vaccination Overdue',
    emailBody: `Dear {{farmer_name}},<br><br>
Vaccination for <strong>{{animal_tag}}</strong> ({{animal_type}}) with <strong>{{vaccine_name}}</strong> is currently <strong>OVERDUE by {{overdue_days}} days</strong>.<br><br>
Unvaccinated livestock in active grazing areas present a high biological vulnerability.<br><br>
<strong>Immediate Steps:</strong><br>
1. Restrict herd movement outside farm premises.<br>
2. Contact the Baramati/Shirur Mobile Veterinary Dispensary.<br>
3. Request an expedited field visit.`,
  },

  DISEASE_ALERT: {
    subject: 'REGIONAL HEALTH ALERT: {{disease_name}} in {{region}}',
    telegram: `⚠️ <b>REGIONAL DISEASE ALERT</b>\n\n<b>Disease:</b> {{disease_name}}\n<b>Region:</b> {{region}}\n<b>Risk Level:</b> {{risk_level}}\n<b>Cases Reported:</b> {{case_count}}\n\nCases have been confirmed in your sector. Please monitor your animals closely and contact a veterinarian if symptoms appear.\n\n<b>Action:</b> {{recommended_action}}\n<b>Authority:</b> {{source_authority}}`,
    sms: 'REGIONAL DISEASE ALERT: {{disease_name}} reported in {{region}} ({{case_count}} cases, Risk: {{risk_level}}). {{recommended_action}} Helpline: 1962.',
    emailHeadline: 'Regional Disease Advisory Notification',
    emailBody: `Dear Livestock Stakeholder,<br><br>
An active animal disease advisory has been issued for <strong>{{region}}</strong> regarding <strong>{{disease_name}}</strong>.<br><br>
<strong>Surveillance Summary:</strong><br>
• Risk Level: <strong>{{risk_level}}</strong><br>
• Verified Cases: <strong>{{case_count}}</strong><br>
• Issuing Authority: {{source_authority}}<br><br>
<strong>Containment Measures:</strong><br>
{{recommended_action}}`,
  },

  HIGH_RISK_ALERT: {
    subject: 'HIGH RISK OUTBREAK ALERT: {{disease_name}} in {{region}}',
    telegram: `🟠 <b>HIGH RISK DISEASE OUTBREAK</b>\n\n<b>Disease:</b> {{disease_name}}\n<b>Region:</b> {{region}}\n<b>Risk:</b> HIGH ({{case_count}} verified cases)\n\n<b>Urgent Protocol:</b>\n{{recommended_action}}\n\nDo not transport livestock out of this block. Mobile Vet Squad (1962) deployed.`,
    sms: '[HIGH RISK] {{disease_name}} cluster in {{region}} ({{case_count}} cases). Maintain isolation & biosecurity barrier. Call 1962 for assistance.',
    emailHeadline: 'High-Risk Outbreak Containment Notice',
    emailBody: `URGENT BIOSECURITY ALERT<br><br>
A cluster of <strong>{{disease_name}}</strong> with <strong>{{case_count}} cases</strong> has been identified in <strong>{{region}}</strong>.<br><br>
<strong>Mandatory Biosecurity Directives:</strong><br>
{{recommended_action}}<br><br>
Report any unexplained fever, salivation, or vesicular lesions immediately to Emergency Line 1962.`,
  },

  CRITICAL_ALERT: {
    subject: 'CRITICAL BIOSECURITY OUTBREAK: {{disease_name}} in {{region}}',
    telegram: `🔴 <b>CRITICAL LIVESTOCK OUTBREAK</b>\n\n<b>Disease:</b> {{disease_name}}\n<b>Region:</b> {{region}}\n<b>Risk:</b> CRITICAL\n<b>Confirmed Cases:</b> {{case_count}}\n\n<b>Immediate Containment:</b>\n{{recommended_action}}\n\nStrict quarantine active within 5km radius. Emergency Vet Van (1962) on site.`,
    sms: '[CRITICAL ALERT] Confirmed {{disease_name}} in {{region}} ({{case_count}} cases). Immediate herd quarantine and ring vaccination active. Emergency Vet Line: 1962.',
    emailHeadline: 'CRITICAL EPIDEMIC DECLARATION',
    emailBody: `CRITICAL LIVESTOCK OUTBREAK NOTIFICATION<br><br>
<strong>CRITICAL OUTBREAK DECLARATION</strong><br>
Authorized by: {{source_authority}}<br><br>
Confirmed outbreak of <strong>{{disease_name}}</strong> in <strong>{{region}}</strong> with <strong>{{case_count}} active cases</strong>.<br><br>
<strong>Immediate Containment Protocol:</strong><br>
{{recommended_action}}<br><br>
Do NOT move animals outside containment zone. Mobile veterinary emergency van (1962) has been deployed in your sector.`,
  },

  SEASONAL_ALERT: {
    subject: 'Seasonal Health Advisory: Vector & Monsoon Prevention',
    telegram: `🌦️ <b>Seasonal Livestock Health Advisory</b>\n\n<b>Region:</b> {{region}}\n<b>Advisory:</b> {{alert_summary}}\n\n<b>Recommended Steps:</b>\n{{recommended_action}}`,
    sms: 'SEASONAL ADVISORY ({{region}}): {{alert_summary}} Recommended: {{recommended_action}} - JeevRakshak AI.',
    emailHeadline: 'Seasonal Livestock Management Advisory',
    emailBody: `Dear Farmer / Veterinarian,<br><br>
Please observe seasonal bio-risk guidance for <strong>{{region}}</strong>:<br><br>
<strong>Advisory Summary:</strong><br>
{{alert_summary}}<br><br>
<strong>Prophylactic Measures:</strong><br>
{{recommended_action}}`,
  },

  VACCINATION_CAMPAIGN: {
    subject: 'NADCP Vaccination Campaign in {{region}}',
    telegram: `📢 <b>Vaccination Campaign Announcement</b>\n\n<b>Campaign:</b> {{vaccine_name}} Mass Immunization\n<b>Region:</b> {{region}}\n<b>Dates:</b> {{campaign_dates}}\n\nFree vaccination provided by Department of Animal Husbandry. Bring your herd ear tags.`,
    sms: 'VACCINATION DRIVE: Free {{vaccine_name}} drive in {{region}} from {{campaign_dates}}. Bring your animals to designated camps. JeevRakshak AI.',
    emailHeadline: 'National Animal Disease Control Programme (NADCP) Drive',
    emailBody: `Dear Livestock Rearers of {{region}},<br><br>
The Department of Animal Husbandry announces the <strong>{{vaccine_name}}</strong> vaccination campaign.<br><br>
<strong>Schedule & Location:</strong><br>
• Campaign Period: <strong>{{campaign_dates}}</strong><br>
• Designated Centers: Village Gram Panchayat & Taluka Polyclinic<br><br>
Ensure all cattle, buffaloes, and small ruminants are tagged and vaccinated.`,
  },

  VET_INTERVENTION_ALERT: {
    subject: 'Veterinary Operational Directive: Overdue Clusters in {{region}}',
    telegram: `🚨 <b>Vet Action Alert</b>\n\n<b>Sector:</b> {{region}}\n<b>Target Disease:</b> {{disease_name}}\n<b>Risk Priority:</b> {{risk_level}}\n\n📊 <b>Operational Summary:</b>\n• Overdue Herd Vaccinations: <b>{{overdue_count}}</b>\n• Cases Requiring Review: <b>{{reports_requiring_review}}</b>\n\n👉 <i>Open JeevRakshak Doctor Dashboard for patient queue and ring vaccination protocol.</i>`,
    sms: 'VET DIRECTIVE ({{region}}): {{overdue_count}} animals overdue for {{disease_name}}. {{reports_requiring_review}} reports need triage. Check dashboard.',
    emailHeadline: 'Field Intervention Directive for Veterinarians',
    emailBody: `Dear Doctor {{vet_name}},<br><br>
Surveillance telemetry indicates actionable veterinary follow-ups in your jurisdiction (<strong>{{region}}</strong>):<br><br>
• Overdue Vaccinations in Sector: <strong>{{overdue_count}}</strong><br>
• Triage Reports Awaiting Confirmation: <strong>{{reports_requiring_review}}</strong><br>
• Suspected Cases: <strong>{{case_count}}</strong><br><br>
<strong>Clinical Directive:</strong><br>
{{recommended_action}}<br><br>
Please access your Veterinarian Workspace on JeevRakshak AI to review patient logs, issue prescriptions, and coordinate ring vaccination barriers.`,
  },

  IMPORTANT_ANNOUNCEMENT: {
    subject: 'Important Animal Health Announcement – JeevRakshak AI',
    telegram: `📢 <b>Important Animal Health Announcement</b>\n\n<b>Region:</b> {{region}}\n\n{{alert_summary}}\n\n<b>Action Advised:</b> {{recommended_action}}\n<b>Authority:</b> {{source_authority}}`,
    sms: 'IMPORTANT ANNOUNCEMENT (JeevRakshak AI): {{alert_summary}} Helpline: 1962.',
    emailHeadline: 'Important Departmental Announcement',
    emailBody: `Dear {{user_name}},<br><br>
Please note the following official announcement regarding livestock welfare in {{region}}:<br><br>
{{alert_summary}}<br><br>
<strong>Action Advised:</strong><br>
{{recommended_action}}<br><br>
Authority: {{source_authority}}`,
  },
};

export function renderNotificationMessage(
  type: NotificationType,
  variables: NotificationTemplateVariables
): RenderedMessage {
  const tpl = NOTIFICATION_TEMPLATES[type] || NOTIFICATION_TEMPLATES.IMPORTANT_ANNOUNCEMENT;

  const subject = interpolateTemplate(tpl.subject, variables);
  const telegramContent = interpolateTemplate(tpl.telegram, variables);
  const rawSms = interpolateTemplate(tpl.sms, variables);
  const emailHeadline = interpolateTemplate(tpl.emailHeadline, variables);
  const emailBody = interpolateTemplate(tpl.emailBody, variables);

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f6f8; color: #1e293b; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 24px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.2px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 28px; font-size: 14px; line-height: 1.6; color: #334155; }
    .footer { background: #f8fafc; padding: 18px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #ecfdf5; color: #047857; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>JeevRakshak AI • जीवक्षक</h1>
      <p>Maharashtra State Livestock Disease Surveillance & Management System</p>
    </div>
    <div class="content">
      <h2 style="font-size: 17px; margin-top: 0; color: #0f172a;">${emailHeadline}</h2>
      <div>${emailBody}</div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0;">Government of Maharashtra • Department of Animal Husbandry</p>
      <p style="margin: 0;">Emergency Mobile Veterinary Service Helpline: <strong>1962</strong> | Portal: jeevrakshak.org</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const emailText = `${subject}\n\n${emailHeadline}\n\n${emailBody.replace(/<br\s*[\/]?>/gi, '\n').replace(/<[^>]+>/g, '')}\n\nEmergency Helpline: 1962\nJeevRakshak AI - Govt of Maharashtra`;

  return {
    subject,
    telegramContent,
    smsContent: rawSms,
    emailText,
    emailHtml,
  };
}
