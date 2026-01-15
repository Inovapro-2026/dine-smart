// Supabase Edge Function: WhatsApp proxy (avoids CORS/mixed-content)
// External API: ISA (Baileys)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE = 'http://148.230.76.60:3333';

type Action = 'status' | 'qr' | 'send';

type RequestBody = {
  action: Action;
  number?: string;
  message?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractQrSrc(html: string): string | null {
  // API may return: <img src="data:image/png;base64,..." /> or single quotes
  const srcMatch = html.match(/src\s*=\s*['"]([^'"]+)['"]/i);
  if (srcMatch?.[1]) return srcMatch[1];

  // Fallback: sometimes returns only the base64 payload
  const b64Match = html.match(/base64,([A-Za-z0-9+/=]+)\s*/i);
  if (b64Match?.[1]) return `data:image/png;base64,${b64Match[1]}`;

  // Fallback: raw base64 without prefix
  const rawB64 = html.trim();
  if (/^[A-Za-z0-9+/=]+$/.test(rawB64) && rawB64.length > 200) {
    return `data:image/png;base64,${rawB64}`;
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;

    if (!body?.action) return json({ error: 'Missing action' }, 400);

    if (body.action === 'status') {
      const r = await fetch(`${API_BASE}/status`);
      const data = await r.json().catch(() => ({}));
      // expected: { status: 'open'|'connecting'|'close' }
      return json({ status: data.status ?? null });
    }

    if (body.action === 'qr') {
      const r = await fetch(`${API_BASE}/qr`);
      const text = await r.text();
      const src = extractQrSrc(text);
      return json({ qr: src, raw: src ? undefined : text });
    }

    if (body.action === 'send') {
      const number = (body.number ?? '').toString();
      const message = (body.message ?? '').toString();
      if (!number || !message) return json({ error: 'Missing number/message' }, 400);

      const r = await fetch(`${API_BASE}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, message }),
      });

      const data = await r.json().catch(() => ({}));
      return json(data, r.ok ? 200 : 400);
    }

    return json({ error: 'Invalid action' }, 400);
  } catch (e) {
    console.error('whatsapp-proxy error', e);
    return json({ error: 'Internal error' }, 500);
  }
});
