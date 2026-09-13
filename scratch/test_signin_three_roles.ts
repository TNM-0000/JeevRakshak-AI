// scratch/test_signin_three_roles.ts
import { dataService } from '../src/lib/supabase/dataService';

async function testSignInAllRoles() {
  console.log('--- Testing 3-Role Sign In & Direct Redirection ---');

  // 1. Test Veterinarian Login with License
  console.log('\n[1] Testing Vet Login with License MSVC-18492:');
  const vetRes = await dataService.signInUser({
    login: 'MSVC-18492',
    password: 'Vet@12345',
    role: 'veterinarian',
  });
  console.log('Vet Login result:', {
    profileRole: (vetRes.profile as any)?.role,
    name: vetRes.profile?.full_name,
    currentRole: dataService.getCurrentRole(),
    hospitalSetupDone: dataService.hasCompletedVetHospitalSetup(),
    error: vetRes.error,
  });

  if ((vetRes.profile as any)?.role !== 'veterinarian') {
    throw new Error('Vet role login failed!');
  }
  if (!dataService.hasCompletedVetHospitalSetup()) {
    throw new Error('Vet hospital setup not marked done!');
  }

  // 2. Test Farmer Login with Phone
  console.log('\n[2] Testing Farmer Login with Phone 9823012345:');
  const farmerRes = await dataService.signInUser({
    login: '9823012345',
    password: 'Farmer@123',
    role: 'farmer',
  });
  console.log('Farmer Login result:', {
    profileRole: (farmerRes.profile as any)?.role,
    name: farmerRes.profile?.full_name,
    currentRole: dataService.getCurrentRole(),
    error: farmerRes.error,
  });

  if ((farmerRes.profile as any)?.role !== 'farmer') {
    throw new Error('Farmer role login failed!');
  }

  // 3. Test Government Official Login with Employee ID
  console.log('\n[3] Testing Govt Login with Employee ID MH-DAHD-0412:');
  const govRes = await dataService.signInUser({
    login: 'MH-DAHD-0412',
    password: 'Govt@12345',
    role: 'government',
  });
  console.log('Govt Login result:', {
    profileRole: (govRes.profile as any)?.role,
    name: govRes.profile?.full_name,
    currentRole: dataService.getCurrentRole(),
    error: govRes.error,
  });

  if ((govRes.profile as any)?.role !== 'government') {
    throw new Error('Government role login failed!');
  }

  // 4. Test Vet Login with Phone
  console.log('\n[4] Testing Vet Login with Phone 9823011111:');
  const vetPhoneRes = await dataService.signInUser({
    login: '9823011111',
    password: 'Vet@12345',
    role: 'veterinarian',
  });
  console.log('Vet Phone Login result:', {
    profileRole: (vetPhoneRes.profile as any)?.role,
    name: vetPhoneRes.profile?.full_name,
    currentRole: dataService.getCurrentRole(),
    error: vetPhoneRes.error,
  });

  if ((vetPhoneRes.profile as any)?.role !== 'veterinarian') {
    throw new Error('Vet phone login failed!');
  }

  console.log('\n>>> ALL 3 ROLES AUTHENTICATION & DIRECT ROUTING PASSED! <<<');
}

testSignInAllRoles().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
