// start-web.js - High-performance multi-worker runner with low-memory option for Render
const cluster = require('cluster');
const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = fs.existsSync(path.join(__dirname, 'apps', 'web'))
  ? __dirname
  : path.resolve(__dirname, '..', '..');

const appDir = path.join(rootDir, 'apps', 'web');

// Find next package across possible locations
function resolveNextPackage() {
  const candidates = [
    path.join(appDir, 'node_modules', 'next'),
    path.join(rootDir, 'node_modules', 'next'),
    'next',
  ];
  for (const c of candidates) {
    try {
      return require(c);
    } catch {}
  }
  return require('next');
}

// Find next binary for build
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

// Check build artifacts
const buildIdFile = path.join(appDir, '.next', 'BUILD_ID');
if (!fs.existsSync(buildIdFile)) {
  console.log('[NEOM School] .next build artifacts missing! Building application now...');
  try {
    const nextBin = resolveNextBin();
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

// Port resolution
let cliPort = null;
for (let i = 0; i < process.argv.length; i++) {
  if ((process.argv[i] === '-p' || process.argv[i] === '--port') && process.argv[i + 1]) {
    cliPort = parseInt(process.argv[i + 1], 10);
    break;
  }
}

const port = cliPort || parseInt(process.env.PORT, 10) || (process.env.RENDER ? 10000 : 3000);
const host = '0.0.0.0';

// Concurrency determination:
// On Render free tier (512MB RAM), default to 1 worker to strictly respect 350MB heap limit.
// On multi-core hosts, utilize up to 4 cluster workers for handling 300-400 concurrent users.
const isRender = !!process.env.RENDER;
const WORKER_COUNT = parseInt(
  process.env.WEB_CONCURRENCY || (isRender ? '1' : String(Math.min(4, os.cpus().length))),
  10
);

if (cluster.isPrimary && WORKER_COUNT > 1) {
  console.log(`[NEOM School Primary] Starting ${WORKER_COUNT} cluster workers on ${host}:${port} for peak 400-user concurrency...`);

  for (let i = 0; i < WORKER_COUNT; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[NEOM School Primary] Worker ${worker.process.pid} died (${signal || code}). Respawning replacement worker...`);
    cluster.fork();
  });
} else {
  // Worker process (or single process if WORKER_COUNT === 1)
  const next = resolveNextPackage();
  const app = next({
    dev: false,
    dir: appDir,
    hostname: host,
    port,
  });

  const handle = app.getRequestHandler();

  app
    .prepare()
    .then(() => {
      const server = http.createServer((req, res) => {
        handle(req, res);
      });

      // Tune HTTP Keep-Alive for high throughput under heavy concurrent load
      server.keepAliveTimeout = 65000;
      server.headersTimeout = 66000;
      server.maxRequestsPerSocket = 20000;

      server.listen(port, host, () => {
        const workerTag = cluster.isWorker ? `[Worker ${process.pid}]` : `[Single]`;
        console.log(`[NEOM School] ${workerTag} Ready and listening on http://${host}:${port}`);
      });
    })
    .catch((err) => {
      console.error(`[NEOM School Worker ${process.pid}] Failed to prepare Next.js app:`, err);
      process.exit(1);
    });
}
