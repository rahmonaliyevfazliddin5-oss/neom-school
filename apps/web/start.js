// apps/web/start.js - Runner inside apps/web
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const appDir = __dirname;
const nextBin = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next');

// Check if .next/BUILD_ID exists; if missing, build on the fly
const buildIdFile = path.join(appDir, '.next', 'BUILD_ID');
if (!fs.existsSync(buildIdFile)) {
  console.log('[NEOM School] .next build artifacts missing! Building application now...');
  try {
    execSync(`node --max-old-space-size=350 "${nextBin}" build "${appDir}"`, {
      stdio: 'inherit',
      cwd: appDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    });
    console.log('[NEOM School] Build completed successfully!');
  } catch (err) {
    console.error('[NEOM School] On-the-fly build failed:', err);
    process.exit(1);
  }
}

const port = process.env.PORT || (process.env.RENDER ? 10000 : 3000);
const host = '0.0.0.0';

console.log(`[NEOM School] Launching Next.js on ${host}:${port} with 350MB max heap...`);

const child = spawn(
  process.execPath,
  ['--max-old-space-size=350', nextBin, 'start', appDir, '-H', host, '-p', String(port)],
  {
    stdio: 'inherit',
    cwd: appDir,
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: host,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
    },
  }
);

child.on('error', (err) => {
  console.error('[NEOM School] Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
