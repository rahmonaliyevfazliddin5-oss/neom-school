// start-web.js - High-performance low-memory runner for Render Free Tier (512MB limit)
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Determine root directory safely
const rootDir = fs.existsSync(path.join(__dirname, 'apps', 'web'))
  ? __dirname
  : path.resolve(__dirname, '..', '..');

const appDir = path.join(rootDir, 'apps', 'web');

// Find next binary across multiple possible monorepo locations
function resolveNextBin() {
  const candidates = [
    path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
    path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
    path.join(appDir, 'node_modules', '.bin', 'next'),
    path.join(rootDir, 'node_modules', '.bin', 'next'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'next';
}

const nextBin = resolveNextBin();

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

// Check if port is passed via CLI arguments (e.g. -p 10000 or --port 10000)
let cliPort = null;
for (let i = 0; i < process.argv.length; i++) {
  if ((process.argv[i] === '-p' || process.argv[i] === '--port') && process.argv[i + 1]) {
    cliPort = parseInt(process.argv[i + 1], 10);
    break;
  }
}

// Render binds to $PORT (typically 10000). On local machine defaults to 3000.
const port = cliPort || process.env.PORT || (process.env.RENDER ? 10000 : 3000);
const host = '0.0.0.0';

console.log(`[NEOM School] Launching Next.js on ${host}:${port} with 350MB max heap for Render 512MB limit...`);

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
