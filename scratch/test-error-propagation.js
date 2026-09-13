// Test Production Mode Error Propagation (Step 13 & Step 8/9 validation)
// Proves that in production mode, real external errors are returned and NOT masked

const BASE_URL = 'http://localhost:3000';

async function testErrorPropagation() {
  console.log('Testing error propagation for unlinked user on Telegram...');
  const res = await fetch(`${BASE_URL}/api/telegram/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'unlinked_random_user_99999' }),
  });
  const data = await res.json();
  console.log('HTTP Status:', res.status);
  console.log('Response:', data);

  if (res.status === 400 && data.success === false && data.error) {
    console.log('✅ Error correctly returned and not faked as success!');
  } else {
    console.error('❌ Error handling failed:', data);
    process.exit(1);
  }
}

testErrorPropagation();
