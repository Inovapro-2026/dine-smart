// Supabase Edge Function: WhatsApp proxy (avoids CORS/mixed-content)
// External API: ISA (Baileys)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE = 'http://148.230.76.60:3333';

type Action = 'status' | 'qr' | 'send' | 'webhook';

type RequestBody = {
  action: Action;
  number?: string;
  message?: string;
  // Webhook payload from ISA
  from?: string;
  text?: string;
  isFirstMessage?: boolean;
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

async function sendWhatsAppMessage(number: string, message: string): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number, message }),
    });
    return r.ok;
  } catch (e) {
    console.error('Error sending message:', e);
    return false;
  }
}

async function getWelcomeMessage(): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data } = await supabase
      .from('store_settings')
      .select('whatsapp_welcome_message')
      .limit(1)
      .maybeSingle();

    if (data?.whatsapp_welcome_message) {
      return data.whatsapp_welcome_message;
    }
  } catch (e) {
    console.error('Error fetching welcome message:', e);
  }

  // Default welcome message
  return '👋 Bem-vindo ao INOVAFOOD!\nEscolha uma opção abaixo 👇\n\n1️⃣ Ver cardápio\n2️⃣ Falar com atendente\n3️⃣ Ver meu pedido\n4️⃣ Horário de funcionamento';
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

    // Webhook: called by ISA when receiving a message
    if (body.action === 'webhook') {
      const from = (body.from ?? body.number ?? '').toString();
      const text = (body.text ?? body.message ?? '').toString();
      const isFirst = body.isFirstMessage ?? true; // Assume first message if not specified

      console.log(`Webhook received from ${from}: ${text} (isFirst: ${isFirst})`);

      if (!from) {
        return json({ error: 'Missing "from" number' }, 400);
      }

      // Only send welcome message on first interaction
      if (isFirst) {
        const welcomeMessage = await getWelcomeMessage();
        const sent = await sendWhatsAppMessage(from, welcomeMessage);
        
        console.log(`Welcome message sent to ${from}: ${sent}`);
        
        return json({ 
          status: sent ? 'success' : 'failed',
          action: 'welcome_sent',
          to: from 
        });
      }

      // For subsequent messages, just acknowledge
      return json({ status: 'received', from, text });
    }

    return json({ error: 'Invalid action' }, 400);
  } catch (e) {
    console.error('whatsapp-proxy error', e);
    return json({ error: 'Internal error' }, 500);
  }
});
