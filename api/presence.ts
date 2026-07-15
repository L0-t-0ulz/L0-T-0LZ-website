/* ============================================================
   F5 — Live presence. Each client heartbeats its id into a Redis
   sorted set scored by timestamp; stale entries (>30s) are pruned,
   and ZCARD is the real number of people exploring right now.
   ============================================================ */
import { createClient } from 'redis';

// `process`/`Date` are provided by the Vercel Node runtime; declare `process`
// so this file typechecks standalone without @types/node.
declare const process: { env: Record<string, string | undefined> };

const WINDOW_MS = 30_000;

interface Req {
  method?: string;
  body?: unknown;
}
interface Res {
  status: (code: number) => Res;
  json: (data: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

let client: ReturnType<typeof createClient> | null = null;

async function getClient(): Promise<ReturnType<typeof createClient> | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!client) {
    client = createClient({ url, socket: { connectTimeout: 5000 } });
    client.on('error', () => {
      /* handled per-call */
    });
  }
  if (!client.isOpen) await client.connect();
  return client;
}

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const id = String((body as { id?: unknown })?.id ?? '').slice(0, 64);
  if (!id) {
    res.status(400).json({ error: 'missing_id' });
    return;
  }

  let db: ReturnType<typeof createClient> | null = null;
  try {
    db = await getClient();
  } catch {
    db = null;
  }
  if (!db) {
    res.status(200).json({ count: null });
    return;
  }

  try {
    const now = Date.now();
    await db.zAdd('presence', { score: now, value: id });
    await db.zRemRangeByScore('presence', 0, now - WINDOW_MS);
    const count = await db.zCard('presence');
    res.status(200).json({ count });
  } catch {
    res.status(200).json({ count: null });
  }
}
