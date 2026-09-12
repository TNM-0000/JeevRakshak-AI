import { NextRequest, NextResponse } from 'next/server';
import { DiseaseAlert } from '@/types/notificationSystem';
import { dataService } from '@/lib/supabase/dataService';
import { findRecipientsForAlert } from '@/lib/notifications/regionalRiskEngine';
import { notificationService } from '@/lib/notifications/notificationService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const district = searchParams.get('district') || undefined;

    let alerts = await dataService.getDiseaseAlerts();
    if (status) {
      alerts = alerts.filter((a) => a.status === status);
    }
    if (district) {
      alerts = alerts.filter((a) => a.district.toLowerCase() === district.toLowerCase());
    }

    return NextResponse.json({ success: true, total: alerts.length, alerts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch disease alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Omit<DiseaseAlert, 'id' | 'created_at' | 'status'> & {
      sendNotifications?: boolean;
      channels?: ('sms' | 'email')[];
    };

    if (!body.disease_name || !body.district || !body.risk_level || !body.recommended_action) {
      return NextResponse.json(
        { error: 'Missing required fields: disease_name, district, risk_level, and recommended_action are required' },
        { status: 400 }
      );
    }

    // 1. Create Alert in database
    const newAlert = await dataService.createDiseaseAlert({
      disease_id: body.disease_id || 'dis-gen',
      disease_name: body.disease_name,
      region_level: body.region_level || 'district',
      district: body.district,
      block: body.block || undefined,
      village: body.village || undefined,
      risk_level: body.risk_level,
      case_count: Number(body.case_count) || 0,
      reported_date: body.reported_date || new Date().toISOString(),
      alert_start_date: body.alert_start_date || new Date().toISOString(),
      alert_expiry_date: body.alert_expiry_date || new Date(Date.now() + 86400000 * 14).toISOString(),
      recommended_action: body.recommended_action,
      source_authority: body.source_authority || 'Department of Animal Husbandry, Govt of Maharashtra',
      target_audience: body.target_audience || 'both',
    });

    let notificationsDispatched = 0;

    // 2. Target matching farmers and vets in that region if notifications requested
    if (body.sendNotifications !== false) {
      const profiles = await dataService.getAllProfiles();
      const rolesMap = new Map<string, 'farmer' | 'veterinarian' | 'government'>();
      for (const p of profiles) {
        rolesMap.set(p.id, p.license_number || p.hospital_name ? 'veterinarian' : 'farmer');
      }

      const matches = findRecipientsForAlert(profiles, newAlert, rolesMap);
      const chosenChannels = body.channels || ['sms', 'email'];

      for (const match of matches) {
        const notifType =
          newAlert.risk_level === 'critical'
            ? 'CRITICAL_ALERT'
            : newAlert.risk_level === 'high'
            ? 'HIGH_RISK_ALERT'
            : 'DISEASE_ALERT';

        const regName = [newAlert.village, newAlert.block, newAlert.district].filter(Boolean).join(', ');

        await notificationService.dispatch({
          type: notifType,
          userId: match.profile.id,
          userName: match.profile.full_name,
          userPhone: match.profile.phone || undefined,
          userEmail: match.profile.email || undefined,
          userRole: match.role,
          region: regName,
          relatedEventId: `alert_${newAlert.id}`,
          diseaseId: newAlert.disease_id,
          diseaseName: newAlert.disease_name,
          preferredChannels: chosenChannels,
          isCriticalOverride: newAlert.risk_level === 'critical',
          variables: {
            disease_name: newAlert.disease_name,
            region: regName,
            risk_level: newAlert.risk_level.toUpperCase(),
            case_count: newAlert.case_count,
            alert_summary: `${newAlert.disease_name} alert declared for ${regName}. Risk level: ${newAlert.risk_level.toUpperCase()}.`,
            recommended_action: newAlert.recommended_action,
            source_authority: newAlert.source_authority,
          },
        });

        notificationsDispatched++;
      }
    }

    return NextResponse.json({
      success: true,
      alert: newAlert,
      notificationsDispatched,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create disease alert' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const updated = await dataService.updateDiseaseAlertStatus(id, status);
    return NextResponse.json({ success: true, alert: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update alert' }, { status: 500 });
  }
}
