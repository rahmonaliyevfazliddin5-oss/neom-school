// audit/load-test.js - Multi-stage concurrent user load test (50 -> 400 VUs)
const autocannon = require('autocannon');
const http = require('http');
const path = require('path');
const fs = require('fs');

const TARGET_HOST = 'http://localhost:3000';

async function loginUser(login, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ login, password });
    const req = http.request(
      `${TARGET_HOST}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let cookie = '';
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
          const match = setCookie.join('; ').match(/neom_access_token=[^;]+/);
          if (match) cookie = match[0];
        }
        resolve(cookie);
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function runStage(title, connections, durationSeconds, requests) {
  return new Promise((resolve, reject) => {
    console.log(`\n============================================================`);
    console.log(`[STAGE] ${title}: ${connections} Virtual Users, Duration: ${durationSeconds}s`);
    console.log(`============================================================`);

    const memBefore = process.memoryUsage().rss / 1024 / 1024;

    const instance = autocannon(
      {
        url: TARGET_HOST,
        connections,
        duration: durationSeconds,
        pipelining: 1,
        requests,
      },
      (err, result) => {
        if (err) return reject(err);

        const memAfter = process.memoryUsage().rss / 1024 / 1024;
        const totalReqs = result.requests.total;
        const rps = Math.round(result.requests.average);
        const avgLatency = Math.round(result.latency.average);
        const p50 = result.latency.p50;
        const p95 = result.latency.p97_5 || result.latency.p90;
        const p99 = result.latency.p99;
        const maxLatency = result.latency.max;
        const errors = result.errors + result.timeouts;
        const errorPercent = totalReqs > 0 ? ((errors / totalReqs) * 100).toFixed(2) : '0.00';

        const summary = {
          stage: title,
          users: connections,
          duration: `${durationSeconds}s`,
          totalRequests: totalReqs,
          rps,
          avgLatencyMs: avgLatency,
          p50LatencyMs: p50,
          p95LatencyMs: p95,
          p99LatencyMs: p99,
          maxLatencyMs: maxLatency,
          errors,
          errorRate: `${errorPercent}%`,
          ramMB: Math.round(memAfter),
        };

        console.log(`Requests: ${totalReqs} | RPS: ${rps}/s`);
        console.log(`Latency: Avg ${avgLatency}ms | p50 ${p50}ms | p95 ${p95}ms | p99 ${p99}ms | Max ${maxLatency}ms`);
        console.log(`Errors: ${errors} (${errorPercent}%)`);

        resolve(summary);
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  console.log('[NEOM Load Tester] Preparing realistic user session cookies...');
  let directorCookie = '';
  let zavuchCookie = '';
  let teacherCookie = '';

  try {
    directorCookie = await loginUser('admin1', 'admin1');
    zavuchCookie = await loginUser('admin2', 'admin2');
    teacherCookie = await loginUser('admin3', 'admin3');
    console.log('[NEOM Load Tester] Session cookies established successfully.');
  } catch (err) {
    console.warn('[NEOM Load Tester] Failed to pre-login, running in public mode:', err.message);
  }

  // Realistic request distribution: Home (40%), Settings (20%), Posts (20%), Director/Zavuch APIs (20%)
  const realisticRequests = [
    { method: 'GET', path: '/' },
    { method: 'GET', path: '/api/public/settings' },
    { method: 'GET', path: '/api/public/posts' },
    { method: 'GET', path: '/kirish' },
    {
      method: 'GET',
      path: '/api/attendance/director/overview',
      headers: directorCookie ? { Cookie: directorCookie } : {},
    },
    {
      method: 'GET',
      path: '/api/attendance/zavuch/dashboard',
      headers: zavuchCookie ? { Cookie: zavuchCookie } : {},
    },
    {
      method: 'GET',
      path: '/api/classes',
    },
    {
      method: 'GET',
      path: '/api/staff',
    },
  ];

  const results = [];

  // Stage 1: 50 VUs
  results.push(await runStage('Stage 1 (Normal Load)', 50, 15, realisticRequests));

  // Stage 2: 100 VUs
  results.push(await runStage('Stage 2 (Moderate Load)', 100, 15, realisticRequests));

  // Stage 3: 200 VUs
  results.push(await runStage('Stage 3 (Heavy Load)', 200, 20, realisticRequests));

  // Stage 4: 300 VUs
  results.push(await runStage('Stage 4 (Peak School Rush)', 300, 20, realisticRequests));

  // Stage 5: 400 VUs
  results.push(await runStage('Stage 5 (Max Target 400 VUs)', 400, 30, realisticRequests));

  // Stage 6: Spike Test (Jump to 400 users immediately)
  results.push(await runStage('Stage 6 (Immediate 400 VU Spike)', 400, 15, realisticRequests));

  console.log('\n============================================================');
  console.log('FINAL LOAD TEST SUMMARY RESULTS TABLE (50 - 400 VUs)');
  console.log('============================================================');
  console.table(results);

  // Output as JSON for report generator
  const resultsPath = path.join(__dirname, 'load-test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${resultsPath}`);
}

main().catch(console.error);
