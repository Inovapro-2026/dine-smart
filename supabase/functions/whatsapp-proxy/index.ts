// Supabase Edge Function: WhatsApp proxy with full menu bot
// External API: ISA (Baileys)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE = 'http://148.230.76.60:3333';
const STORE_LINK = 'https://inovafood.inovapro.cloud/';

type Action = 'status' | 'qr' | 'send' | 'webhook';

type RequestBody = {
  action: Action;
  number?: string;
  message?: string;
  from?: string;
  text?: string;
  isFirstMessage?: boolean;
};

interface StoreSettings {
  whatsapp_welcome_message: string;
  opening_hours: Record<string, { open: string; close: string }>;
}

const DAY_NAMES: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractQrSrc(html: string): string | null {
  const srcMatch = html.match(/src\s*=\s*['"]([^'"]+)['"]/i);
  if (srcMatch?.[1]) return srcMatch[1];

  const b64Match = html.match(/base64,([A-Za-z0-9+/=]+)\s*/i);
  if (b64Match?.[1]) return `data:image/png;base64,${b64Match[1]}`;

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

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
}

async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('store_settings')
      .select('whatsapp_welcome_message, opening_hours')
      .limit(1)
      .maybeSingle();

    return {
      whatsapp_welcome_message: data?.whatsapp_welcome_message ?? getDefaultWelcome(),
      opening_hours: data?.opening_hours ?? getDefaultHours(),
    };
  } catch (e) {
    console.error('Error fetching settings:', e);
    return {
      whatsapp_welcome_message: getDefaultWelcome(),
      opening_hours: getDefaultHours(),
    };
  }
}

function getDefaultWelcome(): string {
  return '👋 Bem-vindo ao INOVAFOOD!\nEscolha uma opção abaixo 👇\n\n1️⃣ Ver cardápio\n2️⃣ Falar com atendente\n3️⃣ Ver meu pedido\n4️⃣ Horário de funcionamento';
}

function getDefaultHours(): Record<string, { open: string; close: string }> {
  return {
    monday: { open: '08:00', close: '22:00' },
    tuesday: { open: '08:00', close: '22:00' },
    wednesday: { open: '08:00', close: '22:00' },
    thursday: { open: '08:00', close: '22:00' },
    friday: { open: '08:00', close: '22:00' },
    saturday: { open: '08:00', close: '22:00' },
    sunday: { open: '08:00', close: '22:00' },
  };
}

function formatOpeningHours(hours: Record<string, { open: string; close: string }>): string {
  let message = '🕐 *Horário de Funcionamento*\n\n';
  
  for (const day of DAY_ORDER) {
    const schedule = hours[day];
    if (schedule) {
      message += `${DAY_NAMES[day]}: ${schedule.open} às ${schedule.close}\n`;
    }
  }
  
  return message;
}

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Aguardando confirmação',
  preparing: '🍳 Em preparo',
  ready: '✅ Pronto para retirada',
  out_for_delivery: '🛵 Saiu para entrega',
  completed: '🎉 Entregue',
  cancelled: '❌ Cancelado',
};

async function getCustomerOrders(phone: string): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    // Normalize phone (remove non-digits, ensure starts with 55)
    let normalizedPhone = phone.replace(/\D/g, '');
    if (!normalizedPhone.startsWith('55')) {
      normalizedPhone = '55' + normalizedPhone;
    }
    // Also try without country code for matching
    const phoneWithout55 = normalizedPhone.replace(/^55/, '');
    
    const { data: orders, error } = await supabase
      .from('inovafood_orders')
      .select('id, status, total, created_at, items')
      .or(`customer_phone.ilike.%${phoneWithout55},customer_phone.ilike.%${normalizedPhone}`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching orders:', error);
      return '❌ Erro ao buscar pedidos. Tente novamente.';
    }

    if (!orders || orders.length === 0) {
      return '📭 Você ainda não fez nenhum pedido.\n\nAcesse nosso cardápio para fazer seu primeiro pedido:\n' + STORE_LINK;
    }

    let message = '📦 *Seus Pedidos*\n\n';
    
    for (const order of orders) {
      const date = new Date(order.created_at).toLocaleDateString('pt-BR');
      const time = new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const status = STATUS_LABELS[order.status] || order.status;
      const total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total);
      
      // Get item names
      const items = order.items as Array<{ product: { name: string }; quantity: number }>;
      const itemList = items?.map(i => `${i.quantity}x ${i.product?.name || 'Item'}`).join(', ') || 'Itens';
      
      message += `━━━━━━━━━━━━━━━━━━\n`;
      message += `📅 ${date} às ${time}\n`;
      message += `📝 ${itemList}\n`;
      message += `💰 ${total}\n`;
      message += `${status}\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Para fazer um novo pedido:\n${STORE_LINK}`;
    
    return message;
  } catch (e) {
    console.error('Error in getCustomerOrders:', e);
    return '❌ Erro ao buscar pedidos. Tente novamente.';
  }
}

async function handleMenuOption(option: string, from: string, settings: StoreSettings): Promise<string> {
  const optionNum = option.trim().replace(/[^0-9]/g, '');
  
  switch (optionNum) {
    case '1':
      return `📱 *Cardápio Digital*\n\nAcesse nosso cardápio completo e faça seu pedido:\n\n👉 ${STORE_LINK}\n\n✨ Escolha seus itens favoritos e finalize seu pedido online!`;
    
    case '2':
      return `👤 *Atendente*\n\nAguarde um momento, vou transferir você para um de nossos atendentes.\n\n⏳ Tempo estimado: alguns minutos\n\n_Um atendente entrará em contato em breve!_`;
    
    case '3':
      return await getCustomerOrders(from);
    
    case '4':
      return formatOpeningHours(settings.opening_hours);
    
    default:
      // If not a valid option, send welcome menu again
      return settings.whatsapp_welcome_message + '\n\n_Digite o número da opção desejada._';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;

    if (!body?.action) return json({ error: 'Missing action' }, 400);

    if (body.action === 'status') {
      const r = await fetch(`${API_BASE}/status`);
      const data = await r.json().catch(() => ({}));
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
      const text = (body.text ?? body.message ?? '').toString().trim();
      const isFirst = body.isFirstMessage ?? false;

      console.log(`Webhook received from ${from}: "${text}" (isFirst: ${isFirst})`);

      if (!from) {
        return json({ error: 'Missing "from" number' }, 400);
      }

      const settings = await getStoreSettings();
      
      let responseMessage: string;
      
      // Always process the message - check if it's a menu option or send welcome
      if (!text || isFirst) {
        // First message or empty - send welcome
        responseMessage = settings.whatsapp_welcome_message;
      } else {
        // Process menu option
        responseMessage = await handleMenuOption(text, from, settings);
      }
      
      const sent = await sendWhatsAppMessage(from, responseMessage);
      console.log(`Response sent to ${from}: ${sent}`);
      
      return json({ 
        status: sent ? 'success' : 'failed',
        action: 'response_sent',
        to: from,
        message: responseMessage.substring(0, 100) + '...'
      });
    }

    return json({ error: 'Invalid action' }, 400);
  } catch (e) {
    console.error('whatsapp-proxy error', e);
    return json({ error: 'Internal error' }, 500);
  }
});
