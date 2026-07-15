/* ============================================================
   T04 — Waitlist API (Vercel Serverless Function).
   Stores signups in Redis (Vercel Marketplace "Redis" DB) via
   node-redis over the injected REDIS_URL, and returns a real
   queue position. No store configured → position:null (honest:
   "on the list", never a fake number).
   ============================================================ */
import { createClient } from 'redis';

// `process` is provided by the Vercel Node runtime; declare it so this file
// typechecks standalone without pulling in @types/node.
declare const process: { env: Record<string, string | undefined> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimal shapes for the Vercel Node request/response (no @vercel/node dep).
interface Req {
  method?: string;
  body?: unknown;
}
interface Res {
  status: (code: number) => Res;
  json: (data: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

// Module-scoped client, reused across warm invocations.
let client: ReturnType<typeof createClient> | null = null;

async function getClient(): Promise<ReturnType<typeof createClient> | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!client) {
    client = createClient({ url, socket: { connectTimeout: 5000 } });
    client.on('error', () => {
      /* handled per-call; don't crash on transient socket errors */
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

  const email = String((body as { email?: unknown })?.email ?? '')
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email) || email.length > 254) {
    res.status(400).json({ error: 'invalid_email' });
    return;
  }

  let db: ReturnType<typeof createClient> | null = null;
  try {
    db = await getClient();
  } catch {
    db = null;
  }

  // Store not reachable/configured — accept but never invent a position.
  if (!db) {
    res.status(200).json({ ok: true, position: null, note: 'store_pending' });
    return;
  }

  try {
    const added = await db.sAdd('waitlist:emails', email); // 1 = new, 0 = existing
    let position: number;
    if (added === 1) {
      position = await db.incr('waitlist:count');
      await db.hSet('waitlist:positions', email, String(position));
    } else {
      const stored = await db.hGet('waitlist:positions', email);
      position = stored ? Number(stored) : Number(await db.get('waitlist:count'));
    }
    const total = Number(await db.get('waitlist:count')) || position;
    res.status(200).json({ ok: true, position, total, returning: added !== 1 });
  } catch {
    res.status(500).json({ error: 'store_error' });
  }
}
