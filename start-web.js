// start-web.js - High-performance low-memory runner for Render Free Tier (512MB limit)
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Determine root directory safely
const rootDir = fs.existsSync(path.join(__dirname, 'apps', 'web'))
  ? __dirname
  : path.resolve(__dirname, '..', '..');

const appDir = path.join(rootDir, 'apps', 'web');
const nextBin = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next');

// Render binds to $PORT (typically 10000). Must listen on 0.0.0.0.
const port = process.env.PORT || 10000;
const host = '0.0.0.0';

console.log(`[NEOM School] Launching Next.js on ${host}:${port} with 350MB max heap...`);

const child = spawn(
  process.execPath,
  ['--max-old-space-size=350', nextBin, 'start', appDir, '-H', host, '-p', String(port)],
  {
    stdio: 'inherit',
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
