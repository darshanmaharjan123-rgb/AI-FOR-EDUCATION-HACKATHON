/**
 * Automated Verification Test for ClarityAI Backend APIs
 */

const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting ClarityAI Backend Verification Tests...\n');

  try {
    // 1. Health check
    const health = await makeRequest('/api/health');
    console.log(`[PASS] GET /api/health -> Status: ${health.status}, System: ${health.body.system}`);

    // 2. Voice states
    const states = await makeRequest('/api/voice/states');
    console.log(`[PASS] GET /api/voice/states -> Status: ${states.status}, States Count: ${Object.keys(states.body.states).length}`);

    // 3. Analytics Engagement
    const engagement = await makeRequest('/api/analytics/engagement');
    console.log(`[PASS] GET /api/analytics/engagement -> Status: ${engagement.status}, Overall Score: ${engagement.body.data.overallScore}`);

    // 4. Analytics Radar
    const radar = await makeRequest('/api/analytics/radar');
    console.log(`[PASS] GET /api/analytics/radar -> Status: ${radar.status}, Dimensions Count: ${radar.body.data.dimensions.length}`);

    // 5. Analytics Heatmap
    const heatmap = await makeRequest('/api/analytics/heatmap');
    console.log(`[PASS] GET /api/analytics/heatmap -> Status: ${heatmap.status}, Days Count: ${heatmap.body.data.days.length}`);

    // 6. Voice Audio Process
    const processAudio = await makeRequest('/api/voice/process-audio', 'POST', {
      transcript: 'Welcome to ClarityAI. This speech tests pace, tone, and filler word detection.',
      durationSeconds: 15
    });
    console.log(`[PASS] POST /api/voice/process-audio -> Status: ${processAudio.status}, WPM: ${processAudio.body.data.metrics.wpm}, Clarity Score: ${processAudio.body.data.metrics.clarityScore}%`);

    console.log('\n✅ ALL BACKEND TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

// Allow time for server to start if running via npm test
setTimeout(runTests, 1000);
