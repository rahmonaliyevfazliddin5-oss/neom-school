import { test, expect } from '@playwright/test';

function extractTokenCookie(cookieHeader: string | undefined): string {
  if (!cookieHeader) return '';
  const match = cookieHeader.match(/neom_access_token=[^;,\n\r]+/);
  return match ? match[0] : '';
}

test.describe('Backend API Full Audit & Security Test Suite', () => {
  let directorCookie = '';
  let zavuchCookie = '';
  let teacherCookie = '';

  test.beforeAll(async ({ request }) => {
    // 1. Login Director
    const resDir = await request.post('/api/auth/login', {
      data: { login: 'admin1', password: 'admin1' },
    });
    expect(resDir.status()).toBe(200);
    directorCookie = extractTokenCookie(resDir.headers()['set-cookie']);

    // 2. Login Zavuch
    const resZav = await request.post('/api/auth/login', {
      data: { login: 'admin2', password: 'admin2' },
    });
    expect(resZav.status()).toBe(200);
    zavuchCookie = extractTokenCookie(resZav.headers()['set-cookie']);

    // 3. Login Teacher
    const resTea = await request.post('/api/auth/login', {
      data: { login: 'admin3', password: 'admin3' },
    });
    expect(resTea.status()).toBe(200);
    teacherCookie = extractTokenCookie(resTea.headers()['set-cookie']);
  });

  // --- 1. Public Endpoints ---
  test('1. Public settings endpoint returns 200 and valid schema', async ({ request }) => {
    const res = await request.get('/api/public/settings');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('address');
    expect(body).toHaveProperty('stats');
    expect(body.stats).toHaveProperty('students');
  });

  test('2. Public posts endpoint returns 200 with paginated data', async ({ request }) => {
    const res = await request.get('/api/public/posts');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body).toHaveProperty('meta');
  });

  test('3. Public post details returns 200 or 404 cleanly', async ({ request }) => {
    const res404 = await request.get('/api/public/posts/non-existent-id-999');
    expect(res404.status()).toBe(404);
  });

  // --- 2. Auth & Security Tests ---
  test('4. Login rejects invalid credentials with 401', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { login: 'admin1', password: 'wrongpassword' },
    });
    expect(res.status()).toBe(401);
  });

  test('5. Login rejects empty payload with 400', async ({ request }) => {
    const res = await request.post('/api/auth/login', { data: {} });
    expect(res.status()).toBe(400);
  });

  test('6. Login handles huge payload without crashing (DoS protection)', async ({ request }) => {
    const hugeString = 'A'.repeat(50000);
    const res = await request.post('/api/auth/login', {
      data: { login: hugeString, password: hugeString },
    });
    expect(res.status()).toBe(401);
  });

  test('7. /api/auth/me rejects missing token with 401', async ({ request }) => {
    const res = await request.get('/api/auth/me');
    expect(res.status()).toBe(401);
  });

  test('8. /api/auth/me rejects forged/tampered JWT signature with 401', async ({ request }) => {
    // Forged token: valid JSON payload with "role: DIRECTOR", but fake signature
    const fakeHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const fakePayload = Buffer.from(JSON.stringify({ sub: 'hacker', role: 'DIRECTOR', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const fakeToken = `${fakeHeader}.${fakePayload}.forged_signature_xyz_123`;

    const res = await request.get('/api/auth/me', {
      headers: {
        Cookie: `neom_access_token=${fakeToken}`,
      },
    });
    expect(res.status()).toBe(401);
  });

  test('9. /api/auth/me returns valid profile with genuine token', async ({ request }) => {
    const res = await request.get('/api/auth/me', {
      headers: { Cookie: directorCookie },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.role).toBe('DIRECTOR');
  });

  // --- 3. Attendance Endpoints ---
  test('10. Director overview returns 200 with calculated rates', async ({ request }) => {
    const res = await request.get('/api/attendance/director/overview', {
      headers: { Cookie: directorCookie },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(typeof data.todayRate).toBe('number');
  });

  test('11. Zavuch dashboard returns 200 with absentees and submissions', async ({ request }) => {
    const res = await request.get('/api/attendance/zavuch/dashboard', {
      headers: { Cookie: zavuchCookie },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('absentees');
  });

  test('12. Teacher my-class returns 200 with roster', async ({ request }) => {
    const res = await request.get('/api/attendance/my-class?className=9-A', {
      headers: { Cookie: teacherCookie },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.className).toBe('9-A');
  });

  test('13. Attendance mark validates required fields', async ({ request }) => {
    const res = await request.post('/api/attendance/mark', {
      data: {},
      headers: { Cookie: teacherCookie },
    });
    expect(res.status()).toBe(400);
  });

  test('14. Attendance mark records valid status cleanly', async ({ request }) => {
    const res = await request.post('/api/attendance/mark', {
      data: {
        studentId: 'test-std-1',
        classId: 'class-9A',
        status: 'KELDI',
      },
      headers: { Cookie: teacherCookie },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  test('15. Attendance submit succeeds with valid class', async ({ request }) => {
    const res = await request.post('/api/attendance/submit', {
      data: {
        className: '9-A',
        classId: 'class-9A',
      },
      headers: { Cookie: teacherCookie },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  // --- 4. Classes, Staff, Students & Reports ---
  test('16. Classes endpoint GET and POST validation', async ({ request }) => {
    const resGet = await request.get('/api/classes');
    expect(resGet.status()).toBe(200);

    const resPostInvalid = await request.post('/api/classes', { data: {} });
    expect(resPostInvalid.status()).toBe(400);
  });

  test('17. Staff endpoint GET and POST validation', async ({ request }) => {
    const resGet = await request.get('/api/staff');
    expect(resGet.status()).toBe(200);

    const resPostInvalid = await request.post('/api/staff', { data: {} });
    expect(resPostInvalid.status()).toBe(400);
  });

  test('18. Students endpoint GET and POST validation', async ({ request }) => {
    const resGet = await request.get('/api/students?className=9-A');
    expect(resGet.status()).toBe(200);

    const resPostInvalid = await request.post('/api/students', { data: {} });
    expect(resPostInvalid.status()).toBe(400);
  });

  test('19. Reports class endpoint returns detailed period stats', async ({ request }) => {
    const res = await request.get('/api/reports/class?className=9-A&period=2026-10');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('report');
    expect(data.report.className).toBe('9-A');
  });
});
