/* ============================================================
   T04 — Waitlist API (Vercel Serverless Function).
   Stores signups in Upstash Redis (Vercel KV) via the REST API,
   returns a real queue position. No store configured yet → it
   returns position:null (honest: "on the list", no fake number).

   Zero npm deps: talks to the Upstash REST endpoint with fetch,
   and accepts either the Vercel-KV or Upstash env-var names.
   ============================================================ */

// `process` is provided by the Vercel Node runtime; declare it so this file
// typechecks standalone without pulling in @types/node.
declare const process: { env: Record<string, string | undefined> };

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

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

async function redis(cmd: (string | number)[]): Promise<unknown> {
  const r = await fetch(REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  const j = (await r.json()) as { result?: unknown };
  return j.result;
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

  // Not provisioned yet — accept but never invent a position.
  if (!REST_URL || !REST_TOKEN) {
    res.status(200).json({ ok: true, position: null, note: 'store_pending' });
    return;
  }

  try {
    const added = await redis(['SADD', 'waitlist:emails', email]); // 1 = new, 0 = existing
    let position: number;
    if (added === 1) {
      position = Number(await redis(['INCR', 'waitlist:count']));
      await redis(['HSET', 'waitlist:positions', email, String(position)]);
    } else {
      const stored = await redis(['HGET', 'waitlist:positions', email]);
      position = stored ? Number(stored) : Number(await redis(['GET', 'waitlist:count']));
    }
    const total = Number(await redis(['GET', 'waitlist:count'])) || position;
    res.status(200).json({ ok: true, position, total, returning: added !== 1 });
  } catch {
    res.status(500).json({ error: 'store_error' });
  }
}
