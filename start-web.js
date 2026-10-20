// start-web.js - High-performance low-memory runner for Render Free Tier (512MB limit)
const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || 3000;
const nextBin = path.join(__dirname, 'apps', 'web', 'node_modules', 'next', 'dist', 'bin', 'next');
const appDir = path.join(__dirname, 'apps', 'web');

console.log(`[NEOM School] Launching Next.js on port ${port} with 350MB max heap...`);

const child = spawn(
  process.execPath,
  ['--max-old-space-size=350', nextBin, 'start', appDir, '-p', String(port)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
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
