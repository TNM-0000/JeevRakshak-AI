import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/serverClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      animal_id,
      prescribed_by = 'prof-vet-1',
      treatment_name,
      treatment_name_en,
      treatment_name_hi,
      treatment_name_mr,
      dosage,
      notes,
      notes_en,
      notes_hi,
      notes_mr,
      treatment_date = new Date().toISOString().split('T')[0],
    } = body;

    if (!animal_id || !treatment_name || !dosage) {
      return NextResponse.json(
        { error: 'animal_id, treatment_name, and dosage are required to prescribe treatment.' },
        { status: 400 }
      );
    }

    // 1. Insert treatment into animal_treatments
    const { data: treatmentRows, error: insertError } = await supabaseServer
      .from('animal_treatments')
      .insert([
        {
          animal_id,
          prescribed_by,
          treatment_name,
          treatment_name_en: treatment_name_en || treatment_name,
          treatment_name_hi: treatment_name_hi || treatment_name,
          treatment_name_mr: treatment_name_mr || treatment_name,
          dosage,
          treatment_date,
          notes: notes || '',
          notes_en: notes_en || notes || '',
          notes_hi: notes_hi || notes || '',
          notes_mr: notes_mr || notes || '',
        },
      ])
      .select();

    if (insertError || !treatmentRows || treatmentRows.length === 0) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to insert prescription' },
        { status: 500 }
      );
    }

    const createdTreatment = treatmentRows[0];

    // 2. Locate animal owner to send prescription notification
    const { data: animalData } = await supabaseServer
      .from('animals')
      .select('tag_number, herds(owner_id)')
      .eq('id', animal_id)
      .maybeSingle();

    const rawAnimal: any = animalData;
    const rawHerd: any = Array.isArray(rawAnimal?.herds) ? rawAnimal.herds[0] : rawAnimal?.herds;
    const ownerId = rawHerd?.owner_id;
    if (ownerId) {
      await supabaseServer.from('notifications').insert([
        {
          recipient_profile_id: ownerId,
          title: `New Prescription for ${rawAnimal?.tag_number || 'Animal'}`,
          title_en: `New Prescription for ${rawAnimal?.tag_number || 'Animal'}`,
          title_hi: `पशु ${rawAnimal?.tag_number || ''} के लिए नया उपचार`,
          title_mr: `जनावर ${rawAnimal?.tag_number || ''} साठी औषधोपचार सल्ला`,
          message: `Veterinarian has prescribed: ${treatment_name} (${dosage}). Notes: ${notes || 'Follow dosage schedule.'}`,
          message_en: `Veterinarian has prescribed: ${treatment_name} (${dosage}). Notes: ${notes || 'Follow dosage schedule.'}`,
          message_hi: `पशु चिकित्सक ने निर्धारित किया: ${treatment_name} (${dosage})।`,
          message_mr: `पशुवैद्यकांनी औषध दिले: ${treatment_name} (${dosage}). दिलेल्या वेळेवर औषध द्या.`,
          notification_type: 'health_alert',
          is_read: false,
          language: 'en',
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      treatment: createdTreatment,
      notificationSent: !!ownerId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Prescription creation failure' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const animalId = searchParams.get('animal_id');

    let query = supabaseServer
      .from('animal_treatments')
      .select('*, profiles(full_name, registration_number)')
      .order('treatment_date', { ascending: false });

    if (animalId) {
      query = query.eq('animal_id', animalId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch prescriptions' }, { status: 500 });
  }
}
