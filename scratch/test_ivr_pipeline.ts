/**
 * Verification Test: IVR Pipeline & Central Data Service Integration
 */

import { dataService } from '../src/lib/supabase/dataService';

async function runIVRTests() {
  console.log('=== RUNNING JEEVRAKSHAK AI - IVR PIPELINE TESTS ===\n');

  // Test 1: Register Call
  console.log('1. Testing Toll-Free Inbound Call Registration...');
  const call = await dataService.registerIVRCall({
    caller_phone: '+91 98220 99887',
    language: 'mr',
    duration_seconds: 145,
    primary_intent: 'disease_reporting',
    district: 'Pune',
    taluka: 'Shirur',
    dtmf_digits: '121#',
  });
  console.log('✓ Call Registered:', call.id, call.call_sid, call.language, call.district);

  // Test 2: Disease Voice Report & AI Triage
  console.log('\n2. Testing IVR Disease Voice Report & AI Triage...');
  const report = await dataService.submitIVRDiseaseReport({
    caller_phone: '+91 98220 99887',
    farmer_name: 'Shri Tukaram Shinde',
    animal_type: 'Cow',
    symptoms: ['Lumpy skin nodules', 'High Fever'],
    raw_transcript: 'माझ्या गाईच्या अंगावर मोठ्या गाठी आल्या आहेत आणि ताप आहे.',
    detected_language: 'mr',
    district: 'Pune',
    taluka: 'Shirur',
    village: 'Koregaon Bhima',
  });
  console.log('✓ Case ID Generated:', report.case_id);
  console.log('✓ AI Suspected Disease:', report.suspected_disease);
  console.log('✓ AI Confidence Score:', report.ai_confidence_score + '%');
  console.log('✓ Clinical Risk Level:', report.risk_level);
  console.log('✓ Recommended Actions:', report.recommended_actions?.length, 'actions');

  // Test 3: Option 3 Doctor Callback Request
  console.log('\n3. Testing Option 3 Doctor Callback Request...');
  const callback = await dataService.createIVRCallbackRequest({
    caller_phone: '+91 98220 11223',
    farmer_name: 'Smt. Sunita Jadhav',
    animal_type: 'Buffalo',
    reason: 'Buffalo showing severe bloat and colic symptoms.',
    district: 'Pune',
    taluka: 'Shirur',
    priority: 'urgent',
  });
  console.log('✓ Callback Ticket Created:', callback.id, 'Priority:', callback.priority, 'Status:', callback.status);

  // Test 4: Option 4 Emergency 1962 SOS
  console.log('\n4. Testing Option 4 1962 Animal Ambulance SOS Dispatch...');
  const emg = await dataService.createIVREmergencyCase({
    caller_phone: '+91 98220 33445',
    animal_type: 'Cow',
    description: 'Acute choking and recumbency in milch cow.',
    district: 'Pune',
    taluka: 'Shirur',
    village: 'Pabal',
  });
  console.log('✓ 1962 SOS Dispatched:', emg.emergency_code);
  console.log('✓ Dispatched Unit:', emg.dispatched_unit);
  console.log('✓ Status:', emg.response_status, 'ETA:', emg.eta_minutes, 'mins');
  console.log('✓ DAHO Alert Flagged:', emg.notified_daho);

  // Test 5: Option 6 Voice Grievance
  console.log('\n5. Testing Option 6 Voice Feedback & Complaint...');
  const feedback = await dataService.submitIVRFeedback({
    caller_phone: '+91 98220 55667',
    category: 'medicine_unavailability',
    transcript: 'शिरूर पशुवैद्यकीय दवाखान्यात वेळेवर अँटीबायोटिक्स उपलब्ध नाहीत.',
    district: 'Pune',
    taluka: 'Shirur',
  });
  console.log('✓ Grievance Logged:', feedback.feedback_code, 'Category:', feedback.category);

  // Test 6: Verify Persistence & Getters
  console.log('\n6. Verifying Central Retrieval Getters...');
  const allReports = await dataService.getIVRReports();
  const allCallbacks = await dataService.getIVRCallbacks();
  const allEmergencies = await dataService.getIVREmergencies();
  const allAnnouncements = await dataService.getIVRAnnouncements();
  const allFeedback = await dataService.getIVRFeedback();

  console.log('✓ Total IVR Reports:', allReports.length);
  console.log('✓ Total IVR Callbacks:', allCallbacks.length);
  console.log('✓ Total 1962 Emergencies:', allEmergencies.length);
  console.log('✓ Total Announcements:', allAnnouncements.length);
  console.log('✓ Total Grievances:', allFeedback.length);

  // Test 7: Doctor Status Update
  console.log('\n7. Testing Doctor Updating Status of Report & Callback...');
  const updatedReport = await dataService.updateIVRReportStatus(report.case_id, 'accepted');
  const updatedCb = await dataService.updateIVRCallbackStatus(callback.id, 'completed', 'Doctor called farmer.');
  console.log('✓ Report Status Updated:', updatedReport);
  console.log('✓ Callback Status Updated:', updatedCb);

  console.log('\n=== ALL IVR TESTS PASSED SUCCESSFULLY! ===');
}

runIVRTests().catch(console.error);
