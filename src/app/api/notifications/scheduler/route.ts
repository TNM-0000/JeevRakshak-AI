import { NextRequest, NextResponse } from 'next/server';
import { runSchedulerCycle } from '@/lib/notifications/scheduler';
import { dataService } from '@/lib/supabase/dataService';

export async function POST(req: NextRequest) {
  try {
    // Collect dataset from dataService (Supabase with local fallback)
    const [vaccinations, animals, herds, locations, diseaseAlerts] = await Promise.all([
      dataService.getVaccinations(),
      dataService.getAnimals(),
      dataService.getHerds(),
      dataService.getLocations(),
      dataService.getDiseaseAlerts ? dataService.getDiseaseAlerts() : Promise.resolve([]),
    ]);

    // Query profiles from dataService
    const profiles = (dataService as any).getAllProfiles
      ? await (dataService as any).getAllProfiles()
      : (dataService as any).localStore?.profiles || [];

    const result = await runSchedulerCycle({
      vaccinations,
      animals,
      herds,
      profiles,
      diseaseAlerts,
      onExpireAlert: (alertId) => {
        if (dataService.updateDiseaseAlertStatus) {
          dataService.updateDiseaseAlertStatus(alertId, 'expired');
        }
      },
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scheduler failed' }, { status: 500 });
  }
}
