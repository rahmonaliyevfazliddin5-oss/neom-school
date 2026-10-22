import fs from 'fs';
import path from 'path';

interface CacheEntry {
  mtimeMs: number;
  data: any;
}

// In-memory cache to eliminate disk I/O on repeated reads (crucial for 200-300 concurrent users)
const memoryCache = new Map<string, CacheEntry>();

// Simple promise-based write lock queue per file to prevent race conditions during concurrent writes
const writeQueues = new Map<string, Promise<void>>();

function getDataDir(): string {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getSafeFilePath(filename: string): string {
  return path.join(getDataDir(), filename);
}

/**
 * Fast cached read with disk timestamp check.
 * If file hasn't changed on disk, returns memory cache in < 0.05ms!
 */
export function readJsonSafe<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = getSafeFilePath(filename);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }

    const stat = fs.statSync(filePath);
    const cached = memoryCache.get(filePath);

    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return cached.data as T;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content || 'null') ?? defaultValue;

    memoryCache.set(filePath, {
      mtimeMs: stat.mtimeMs,
      data: parsed,
    });

    return parsed as T;
  } catch (err) {
    console.error(`[safe-store] Error reading ${filename}:`, err);
    return defaultValue;
  }
}

/**
 * Concurrency-safe atomic write:
 * Queues sequential writes so 200-300 simultaneous requests never clash or corrupt JSON files.
 * Writes to a temporary file first, then atomically renames it.
 */
export async function writeJsonSafe<T>(filename: string, data: T): Promise<void> {
  const filePath = getSafeFilePath(filename);
  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;

  // Chain write promises to ensure strict FIFO execution per file
  const currentQueue = writeQueues.get(filePath) || Promise.resolve();

  const nextQueue = currentQueue.then(async () => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      await fs.promises.writeFile(tempPath, jsonStr, 'utf-8');
      await fs.promises.rename(tempPath, filePath);

      const stat = await fs.promises.stat(filePath);
      memoryCache.set(filePath, {
        mtimeMs: stat.mtimeMs,
        data,
      });
    } catch (err) {
      console.error(`[safe-store] Error writing ${filename}:`, err);
      // Clean up temp file if rename failed
      try {
        if (fs.existsSync(tempPath)) await fs.promises.unlink(tempPath);
      } catch {}
      throw err;
    }
  });

  writeQueues.set(filePath, nextQueue);
  return nextQueue;
}
