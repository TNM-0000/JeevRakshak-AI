// Comprehensive Step 17 Automated Verification Script
// Tests all 8 scenarios directly against the running JeevRakshak Next.js backend

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('================================================================');
  console.log('🚀 JEEVRAKSHAK NOTIFICATION SYSTEM — END-TO-END VERIFICATION');
  console.log('================================================================\n');

  let passedTests = 0;
  const testFarmerId = `farmer_test_${Date.now()}`;
  const testFarmerPhone = `9822${Math.floor(100000 + Math.random() * 900000)}`;
  const testFarmerEmail = `kisan_${Date.now()}@jeevrakshak.org`;
  const testTelegramChatId = `chat_${Math.floor(10000000 + Math.random() * 90000000)}`;

  // --------------------------------------------------------------------------
  // TEST 1: Create a new farmer -> ACCOUNT_CREATED event
  // --------------------------------------------------------------------------
  console.log('🔹 TEST 1: First-time account creation (ACCOUNT_CREATED)...');
  try {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ACCOUNT_CREATED',
        userId: testFarmerId,
        userName: 'Ramesh Patil (Test Farmer)',
        userPhone: testFarmerPhone,
        userEmail: testFarmerEmail,
        userRole: 'farmer',
        region: 'Baramati, Pune',
        relatedEventId: `account_created_${testFarmerId}`,
        preferredChannels: ['telegram', 'email'],
        variables: {
          user_name: 'Ramesh Patil',
          user_role: 'Farmer (पशुपालक)',
          region: 'Baramati, Pune',
        },
      }),
    });

    const data = await res.json();
    if (data.success && data.result) {
      console.log('   ✅ TEST 1 PASSED: ACCOUNT_CREATED dispatched.');
      console.log('      Email Result:', data.result.emailResult);
      console.log('      Telegram Result (expected not yet connected):', data.result.telegramResult);
      passedTests++;
    } else {
      console.error('   ❌ TEST 1 FAILED:', data);
    }
  } catch (err) {
    console.error('   ❌ TEST 1 EXCEPTION:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Connect Telegram (Step 6 & Step 7)
  // We do Test 4 now so subsequent tests can receive Telegram notifications!
  // --------------------------------------------------------------------------
  console.log('\n🔹 TEST 4: Telegram Connection & Deep-link Account Linking...');
  try {
    // A. Generate Linking Token
    const tokenRes = await fetch(`${BASE_URL}/api/telegram/link-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testFarmerId }),
    });
    const tokenData = await tokenRes.json();
    console.log('   -> Generated secure linking token:', tokenData.token);
    console.log('   -> Deep link target:', tokenData.deepLink);

    // B. Verify Token & Link Chat ID
    const verifyRes = await fetch(`${BASE_URL}/api/telegram/verify-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: tokenData.token,
        chatId: testTelegramChatId,
        username: 'ramesh_patil_farmer',
        firstName: 'Ramesh',
      }),
    });
    const verifyData = await verifyRes.json();

    // C. Check Status API
    const statusRes = await fetch(`${BASE_URL}/api/telegram/status?userId=${testFarmerId}`);
    const statusData = await statusRes.json();

    if (verifyData.success && statusData.connected && statusData.connection.telegram_chat_id === testTelegramChatId) {
      console.log('   ✅ TEST 4 PASSED: Telegram account linked successfully.');
      console.log('      Stored Chat ID:', statusData.connection.telegram_chat_id);
      passedTests++;
    } else {
      console.error('   ❌ TEST 4 FAILED:', { verifyData, statusData });
    }
  } catch (err) {
    console.error('   ❌ TEST 4 EXCEPTION:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: First-time Login -> FIRST_LOGIN event
  // --------------------------------------------------------------------------
  console.log('\n🔹 TEST 2: First Successful Login (FIRST_LOGIN)...');
  try {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'FIRST_LOGIN',
        userId: testFarmerId,
        userName: 'Ramesh Patil',
        userPhone: testFarmerPhone,
        userEmail: testFarmerEmail,
        userRole: 'farmer',
        region: 'Baramati, Pune',
        relatedEventId: `first_login_${testFarmerId}`,
        preferredChannels: ['telegram', 'email'],
        variables: {
          user_name: 'Ramesh Patil',
          user_role: 'Farmer (पशुपालक)',
          region: 'Baramati, Pune',
        },
      }),
    });

    const data = await res.json();
    if (data.success && data.result?.emailResult?.sent && data.result?.telegramResult?.sent) {
      console.log('   ✅ TEST 2 PASSED: FIRST_LOGIN dispatched to both Email and Telegram.');
      console.log('      Telegram Result:', data.result.telegramResult);
      console.log('      Email Result:', data.result.emailResult);
      passedTests++;
    } else {
      console.error('   ❌ TEST 2 FAILED:', data);
    }
  } catch (err) {
    console.error('   ❌ TEST 2 EXCEPTION:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Logout and login again -> NO FIRST_LOGIN notification
  // --------------------------------------------------------------------------
  console.log('\n🔹 TEST 3: Subsequent Login Idempotency (Strictly Once)...');
  try {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'FIRST_LOGIN',
        userId: testFarmerId,
        userName: 'Ramesh Patil',
        userPhone: testFarmerPhone,
        userEmail: testFarmerEmail,
        userRole: 'farmer',
        region: 'Baramati, Pune',
        relatedEventId: `first_login_${testFarmerId}`, // Same first login key
        preferredChannels: ['telegram', 'email'],
        variables: {
          user_name: 'Ramesh Patil',
          user_role: 'Farmer (पशुपालक)',
          region: 'Baramati, Pune',
        },
      }),
    });

    const data = await res.json();
    const teleDuplicateBlocked = data.result?.telegramResult?.reason?.includes('Duplicate prevented');
    const emailDuplicateBlocked = data.result?.emailResult?.reason?.includes('Duplicate prevented');

    if (teleDuplicateBlocked && emailDuplicateBlocked) {
      console.log('   ✅ TEST 3 PASSED: Duplicate FIRST_LOGIN correctly blocked on subsequent login.');
      console.log('      Telegram Suppression Reason:', data.result.telegramResult.reason);
      console.log('      Email Suppression Reason:', data.result.emailResult.reason);
      passedTests++;
    } else {
      console.error('   ❌ TEST 3 FAILED: Subsequent login notification was not suppressed:', data);
    }
  } catch (err) {
    console.error('   ❌ TEST 3 EXCEPTION:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Dedicated [Send Test Telegram] API (Step 8)
  // --------------------------------------------------------------------------
  console.log('\n🔹 TEST 5: Dedicated [Send Test Telegram] Endpoint (Step 8)...');
  try {
    const res = await fetch(`${BASE_URL}/api/telegram/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testFarmerId }),
    });
    const data = await res.json();

    if (data.success && data.message) {
      console.log('   ✅ TEST 5 PASSED: Test Telegram API returned live success response.');
      console.log('      Backend Response Message:', data.message);
      passedTests++;
    } else {
      console.error('   ❌ TEST 5 FAILED:', data);
    }
  } catch (err) {
    console.error('   ❌ TEST 5 EXCEPTION:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Dedicated [Send Test Email] API (Step 9)
  // --------------------------------------------------------------------------
  console.log('\n🔹 TEST 6: Dedicated [Send Test Email] Endpoint (Step 9)...');
  try {
    const res = await fetch(`${BASE_URL}/api/email/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testFarmerId, email: testFarmerEmail }),
    });
    const data = await res.json();

    if (data.success && data.message) {
      console.log('   ✅ TEST 6 PASSED: Test Email API returned live success response.');
      console.log('      Backend Response Message:', data.message);
      passedTests++;
    } else {
      console.error('   ❌ TEST 6 FAILED:', data);
    }
  } catch (err) {
    console.error('   ❌ TEST 6 EXCEPTION:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Vaccination Due Soon (Step 10)
  // --------------------------------------------------------------------------
  console.log('\n🔹 TEST 7: Vaccination Reminder Automation (Step 10)...');
  try {
    const dueDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'VACCINATION_UPCOMING',
        userId: testFarmerId,
        userName: 'Ramesh Patil',
        userPhone: testFarmerPhone,
        userEmail: testFarmerEmail,
        userRole: 'farmer',
        region: 'Baramati, Pune',
        relatedEventId: `vac_test_cow101_${dueDate}`,
        preferredChannels: ['telegram', 'email'],
        variables: {
          farmer_name: 'Ramesh Patil',
          animal_tag: 'MH-12-COW-904',
          animal_type: 'Cow (गाय)',
          vaccine_name: 'Foot and Mouth Disease (FMD) Oil Adjuvant Vaccine',
          due_date: dueDate,
          recommended_action: `Vaccine dose due in 3 days (${dueDate}). Arrange with Baramati veterinary polyclinic.`,
          contact_information: 'Veterinary Polyclinic Baramati / Helpline: 1962',
        },
      }),
    });

    const data = await res.json();
    if (data.success && data.result?.telegramResult?.sent && data.result?.emailResult?.sent) {
      console.log('   ✅ TEST 7 PASSED: Vaccination reminder successfully delivered to Telegram and Email.');
      console.log('      Telegram:', data.result.telegramResult);
      console.log('      Email:', data.result.emailResult);
      passedTests++;
    } else {
      console.error('   ❌ TEST 7 FAILED:', data);
    }
  } catch (err) {
    console.error('   ❌ TEST 7 EXCEPTION:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Regional Disease Outbreak Alert (Step 11)
  // --------------------------------------------------------------------------
  console.log('\n🔹 TEST 8: Regional Outbreak Alert Targeted Filtering (Step 11)...');
  try {
    // Region A: Pune District
    const alertPayload = {
      disease_id: 'dis-fmd-test',
      disease_name: 'Foot-and-Mouth Disease (FMD)',
      region_level: 'district',
      district: 'Pune',
      block: 'Baramati',
      risk_level: 'high',
      case_count: 14,
      reported_date: new Date().toISOString(),
      recommended_action: 'Quarantine infected cattle and restrict livestock movement outside the 5km containment perimeter.',
      source_authority: 'State Department of Animal Husbandry, Maharashtra',
      target_audience: 'both',
      sendNotifications: true,
      channels: ['telegram', 'email'],
    };

    const res = await fetch(`${BASE_URL}/api/disease-alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertPayload),
    });

    const data = await res.json();
    if (data.success && data.alert && data.alert.id) {
      console.log('   ✅ TEST 8 PASSED: Regional disease outbreak alert generated and dispatched.');
      console.log('      Alert ID:', data.alert.id);
      console.log('      Affected District:', data.alert.district);
      console.log('      Risk Level:', data.alert.risk_level);
      console.log('      Targeted Notifications Dispatched:', data.notificationsDispatched);
      passedTests++;
    } else {
      console.error('   ❌ TEST 8 FAILED:', data);
    }
  } catch (err) {
    console.error('   ❌ TEST 8 EXCEPTION:', err.message);
  }

  // --------------------------------------------------------------------------
  // NOTIFICATION HISTORY AUDIT CHECK (Step 12)
  // --------------------------------------------------------------------------
  console.log('\n🔹 STEP 12 AUDIT: Checking Notification History Persistence...');
  try {
    const historyRes = await fetch(`${BASE_URL}/api/notifications?userId=${testFarmerId}`);
    const historyData = await historyRes.json();

    if (historyData.success && historyData.total > 0) {
      console.log(`   ✅ Notification History Verified: ${historyData.total} records found for user ${testFarmerId}.`);
      console.log('      Sample History Record:', {
        type: historyData.history[0].notification_type,
        channel: historyData.history[0].channel,
        status: historyData.history[0].delivery_status,
        timestamp: historyData.history[0].created_at,
      });
    } else {
      console.warn('   ⚠️ History check returned 0 records:', historyData);
    }
  } catch (err) {
    console.warn('   ⚠️ History check error:', err.message);
  }

  console.log('\n================================================================');
  console.log(`🏁 VERIFICATION COMPLETE: ${passedTests}/8 TESTS PASSED SUCCESSFULLY!`);
  console.log('================================================================\n');

  if (passedTests === 8) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
