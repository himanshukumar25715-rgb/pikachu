/**
 * Test script to verify the backend proxy and API key are working.
 * Make sure the server is running: npm run server
 */

const BACKEND_URL = 'http://localhost:5000/api';

async function testChat() {
  console.log('\n📝 Testing /api/chat endpoint...');
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is 2 + 2?',
        context: 'You are a helpful assistant.'
      })
    });

    if (!response.ok) {
      console.error(`❌ Error: HTTP ${response.status}`);
      const text = await response.text();
      console.error(text);
      return false;
    }

    const data = await response.json();
    if (data.error) {
      console.error('❌ API Error:', data.error);
      return false;
    }

    console.log('✅ Chat works! Response:', data.text);
    return true;
  } catch (err) {
    console.error('❌ Chat test failed:', err.message);
    return false;
  }
}

async function testAnalyzeMood() {
  console.log('\n😊 Testing /api/analyze-mood endpoint...');
  try {
    const response = await fetch(`${BACKEND_URL}/analyze-mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diary: 'Today was a great day! I feel happy and energized.'
      })
    });

    if (!response.ok) {
      console.error(`❌ Error: HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();
    if (data.error) {
      console.error('❌ API Error:', data.error);
      return false;
    }

    console.log('✅ Mood analysis works! Response:', data);
    return true;
  } catch (err) {
    console.error('❌ Mood test failed:', err.message);
    return false;
  }
}

async function testWaterPrediction() {
  console.log('\n💧 Testing /api/predict-water endpoint...');
  try {
    const response = await fetch(`${BACKEND_URL}/predict-water`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weather: 'sunny',
        activity: 'moderate exercise',
        weight: 70
      })
    });

    if (!response.ok) {
      console.error(`❌ Error: HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();
    if (data.error) {
      console.error('❌ API Error:', data.error);
      return false;
    }

    console.log('✅ Water prediction works! Response:', data);
    return true;
  } catch (err) {
    console.error('❌ Water test failed:', err.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing VitalSync Backend Proxy\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('Make sure the server is running: npm run server\n');

  const results = [];
  results.push(await testChat());
  results.push(await testAnalyzeMood());
  results.push(await testWaterPrediction());

  console.log('\n' + '='.repeat(50));
  const passed = results.filter(Boolean).length;
  const total = results.length;
  console.log(`✅ Tests passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('🎉 All tests passed! Your API key is working correctly.');
  } else {
    console.log('❌ Some tests failed. Check errors above.');
    process.exit(1);
  }
}

runTests();
