// JeevRakshak AI - Notification Templates & Variable Interpolator
// Strictly supports 12 official SIH event types (No OTPs)

import {
  NotificationType,
  NotificationTemplateVariables,
  NotificationChannel,
} from '@/types/notificationSystem';

export interface RenderedMessage {
  subject?: string;
  smsContent: string;
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
    sms: string;
    emailHeadline: string;
    emailBody: string;
  }
> = {
  ACCOUNT_CREATED: {
    subject: 'Welcome to JeevRakshak – Account Successfully Created',
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
    subject: 'Welcome to JeevRakshak – First Login Successful',
    sms: 'Welcome to JeevRakshak, {{user_name}}. You have successfully logged in for the first time. You can now access your animal health information and important regional alerts.',
    emailHeadline: 'First Login Successful – Welcome to JeevRakshak AI',
    emailBody: `Dear {{user_name}},<br><br>
You have successfully signed in to JeevRakshak AI for the first time as <strong>{{user_role}}</strong>.<br><br>
Your profile is now active to receive automated health alerts, upcoming vaccination notifications, and regional disease containment advisories tailored to your region: <strong>{{region}}</strong>.<br><br>
Ensure your herd and contact details remain up to date to receive timely alerts.`,
  },

  VACCINATION_UPCOMING: {
    subject: 'Upcoming Vaccination Reminder: {{animal_tag}} ({{vaccine_name}})',
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
    sms: 'URGENT VACCINATION DUE: Your animal {{animal_tag}} is due for {{vaccine_name}} TODAY ({{due_date}}). Ensure vaccination to prevent contagious infection.',
    emailHeadline: 'Vaccination Due Today – Action Required',
    emailBody: `Dear {{farmer_name}},<br><br>
Your animal <strong>{{animal_tag}}</strong> ({{animal_type}}) is due for <strong>{{vaccine_name}}</strong> today ({{due_date}}).<br><br>
Timely vaccination under the National Animal Disease Control Programme (NADCP) is critical to safeguard your livestock against preventable outbreaks.<br><br>
<strong>Veterinary Contact:</strong> {{contact_information}}`,
  },

  VACCINATION_OVERDUE: {
    subject: 'CRITICAL: Overdue Vaccination for {{animal_tag}} ({{vaccine_name}})',
    sms: 'OVERDUE VACCINATION ALERT: Animal {{animal_tag}} is OVERDUE for {{vaccine_name}} vaccination by {{overdue_days}} days. Immediate veterinary administration required.',
    emailHeadline: 'Urgent Notice: Overdue Vaccination Record',
    emailBody: `Dear {{farmer_name}},<br><br>
<span style="color: #dc2626; font-weight: bold;">ATTENTION REQUIRED:</span> Vaccination for <strong>{{animal_tag}}</strong> ({{animal_type}}) with <strong>{{vaccine_name}}</strong> was due on {{due_date}} and is now <strong>OVERDUE</strong>.<br><br>
Unvaccinated livestock in {{region}} are at heightened risk of contagious disease spread.<br><br>
<strong>Immediate Action:</strong><br>
Please contact your local veterinary polyclinic or mobile van immediately to administer the missed dose.`,
  },

  DISEASE_ALERT: {
    subject: 'Regional Animal Disease Alert: {{disease_name}} in {{region}}',
    sms: 'IMPORTANT DISEASE ALERT: {{disease_name}} cases have been reported in {{region}}. Risk Level: {{risk_level}}. Please monitor your animals and contact a vet if concerning signs appear.',
    emailHeadline: 'Official Regional Animal Disease Alert',
    emailBody: `Official Disease Alert issued by <strong>{{source_authority}}</strong>.<br><br>
<strong>Disease:</strong> {{disease_name}}<br>
<strong>Affected Region:</strong> {{region}}<br>
<strong>Current Risk Level:</strong> <span style="font-weight: bold; text-transform: uppercase;">{{risk_level}}</span><br>
<strong>Suspected / Confirmed Cases:</strong> {{case_count}}<br><br>
<strong>Summary:</strong><br>
{{alert_summary}}<br><br>
<strong>Recommended Actions:</strong><br>
{{recommended_action}}<br><br>
<strong>Official Source / Authority:</strong> {{source_authority}}<br>
<strong>Veterinary Helpline:</strong> 1962`,
  },

  HIGH_RISK_ALERT: {
    subject: 'HIGH RISK ALERT: {{disease_name}} Threat Detected in {{region}}',
    sms: 'HIGH RISK DISEASE ALERT: High risk of {{disease_name}} detected in {{region}}. Restrict animal movement and isolate any sick animals immediately.',
    emailHeadline: 'High Risk Animal Health Warning',
    emailBody: `A HIGH RISK disease situation has been confirmed for <strong>{{region}}</strong>.<br><br>
<strong>Disease:</strong> {{disease_name}}<br>
<strong>Risk Classification:</strong> HIGH RISK<br><br>
{{alert_summary}}<br><br>
<strong>Preventive Measures Required:</strong><br>
• Restrict interstate and inter-village animal transport.<br>
• Disinfect shed perimeters and quarantine new livestock.<br>
• Immediately report any oral blisters, skin nodules, or unusual fever via JeevRakshak AI.`,
  },

  CRITICAL_ALERT: {
    subject: 'CRITICAL OUTBREAK ALERT: {{disease_name}} in {{region}} – Immediate Action Required',
    sms: 'CRITICAL OUTBREAK ALERT: Confirmed {{disease_name}} outbreak in {{region}}. Ring vaccination & strict biosecurity activated. Emergency Vet Line: 1962.',
    emailHeadline: 'CRITICAL LIVESTOCK OUTBREAK NOTIFICATION',
    emailBody: `<div style="border-left: 4px solid #dc2626; padding-left: 12px; margin-bottom: 16px;">
<strong style="color: #dc2626; font-size: 16px;">CRITICAL OUTBREAK DECLARATION</strong><br>
Authorized by: {{source_authority}}
</div>
Confirmed outbreak of <strong>{{disease_name}}</strong> in <strong>{{region}}</strong> with {{case_count}} active cases.<br><br>
<strong>Immediate Containment Protocol:</strong><br>
{{recommended_action}}<br><br>
Do NOT move animals outside containment zone. Mobile veterinary emergency van (1962) has been deployed in your sector.`,
  },

  SEASONAL_ALERT: {
    subject: 'Seasonal Animal Health Advisory: {{region}}',
    sms: 'Seasonal Animal Health Alert: Increased disease risk ({{disease_name}}) reported for {{region}}. Monitor your livestock and adhere to official veterinary guidance.',
    emailHeadline: 'Seasonal Livestock Health Advisory',
    emailBody: `Dear Livestock Owner / Veterinarian,<br><br>
Seasonal weather shifts in {{region}} present elevated risk for <strong>{{disease_name}}</strong>.<br><br>
<strong>Advisory Summary:</strong><br>
{{alert_summary}}<br><br>
<strong>Guidance:</strong><br>
{{recommended_action}}<br><br>
Issued in public interest by Department of Animal Husbandry.`,
  },

  VACCINATION_CAMPAIGN: {
    subject: 'Government Vaccination Campaign: {{vaccine_name}} in {{region}}',
    sms: 'Vaccination Campaign: {{vaccine_name}} campaign is being conducted in your area ({{region}}) from {{campaign_dates}}. Contact your nearest authorized veterinary center.',
    emailHeadline: 'Official Livestock Vaccination Campaign Announcement',
    emailBody: `Under the National Animal Disease Control Programme (NADCP), a mass vaccination drive has been scheduled:<br><br>
<strong>Vaccine / Disease:</strong> {{vaccine_name}} ({{disease_name}})<br>
<strong>Target Coverage Area:</strong> {{region}}<br>
<strong>Campaign Window:</strong> {{campaign_dates}}<br><br>
<strong>Eligibility & Instructions:</strong><br>
{{recommended_action}}<br><br>
Free vaccination is provided at all Government Veterinary Dispensaries and Mobile Units.`,
  },

  VET_INTERVENTION_ALERT: {
    subject: 'VET OPERATIONAL ALERT: {{region}} – Interventions Required',
    sms: 'REGIONAL VET ALERT: {{disease_name}} risk elevated in your assigned area ({{region}}). {{overdue_count}} overdue vaccinations and {{reports_requiring_review}} cases require review.',
    emailHeadline: 'Veterinarian Clinical & Field Action Directive',
    emailBody: `Dear Dr. {{vet_name}},<br><br>
This is an operational intelligence dispatch for your assigned jurisdiction: <strong>{{region}}</strong>.<br><br>
<strong>Current Situation:</strong><br>
• Disease: <strong>{{disease_name}}</strong> (Risk Level: <strong>{{risk_level}}</strong>)<br>
• Active Disease Reports Requiring Review: <strong>{{reports_requiring_review}}</strong><br>
• Overdue Vaccinations in Sector: <strong>{{overdue_count}}</strong><br>
• Suspected Cases: <strong>{{case_count}}</strong><br><br>
<strong>Clinical Directive:</strong><br>
{{recommended_action}}<br><br>
Please access your Veterinarian Workspace on JeevRakshak AI to review patient logs, issue prescriptions, and coordinate ring vaccination barriers.`,
  },

  IMPORTANT_ANNOUNCEMENT: {
    subject: 'Important Animal Health Announcement – JeevRakshak AI',
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
    smsContent: rawSms,
    emailText,
    emailHtml,
  };
}
