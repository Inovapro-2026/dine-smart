// Supabase Edge Function: WhatsApp proxy with full menu bot
// External API: ISA (Baileys) or whatsapp-web.js

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API Base - pode ser ISA ou whatsapp-web.js
const API_BASE = Deno.env.get('WHATSAPP_API_URL') || 'http://148.230.76.60:3333';
const STORE_LINK = 'https://inovafood.inovapro.cloud/';

type Action = 'status' | 'qr' | 'send' | 'webhook' | 'notify_order';

type RequestBody = {
  action: Action;
  number?: string;
  message?: string;
  from?: string;
  text?: string;
  isFirstMessage?: boolean;
  // Para notify_order
  orderId?: string;
  customerPhone?: string;
  customerName?: string;
  orderTotal?: number;
  orderItems?: Array<{ name: string; quantity: number }>;
  orderStatus?: string;
};

interface StoreSettings {
  whatsapp_welcome_message: string;
  whatsapp_preparing_message: string;
  whatsapp_ready_message: string;
  whatsapp_delivery_message: string;
  whatsapp_completed_message: string;
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
    // Tentar primeiro o formato do whatsapp-web.js
    let response = await fetch(`${API_BASE}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: number, message }),
    });

    if (!response.ok) {
      // Tentar formato ISA
      response = await fetch(`${API_BASE}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, message }),
      });
    }

    console.log(`WhatsApp message sent to ${number}: ${response.ok}`);
    return response.ok;
  } catch (e) {
    console.error('Error sending WhatsApp message:', e);
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
      .select('*')
      .limit(1)
      .maybeSingle();

    return {
      whatsapp_welcome_message: data?.whatsapp_welcome_message ?? getDefaultWelcome(),
      whatsapp_preparing_message: data?.whatsapp_preparing_message ?? '🍳 *Preparando seu pedido!*\n\nSeu pedido está sendo preparado com carinho. Em breve ficará pronto!',
      whatsapp_ready_message: data?.whatsapp_ready_message ?? '✅ *Pedido pronto!*\n\nSeu pedido está pronto para retirada/entrega!',
      whatsapp_delivery_message: data?.whatsapp_delivery_message ?? '🛵 *Saiu para entrega!*\n\nSeu pedido está a caminho!',
      whatsapp_completed_message: data?.whatsapp_completed_message ?? '🎉 *Pedido entregue!*\n\nObrigado por pedir no INOVAFOOD! Esperamos você em breve!',
      opening_hours: data?.opening_hours ?? getDefaultHours(),
    };
  } catch (e) {
    console.error('Error fetching settings:', e);
    return {
      whatsapp_welcome_message: getDefaultWelcome(),
      whatsapp_preparing_message: '🍳 Preparando seu pedido!',
      whatsapp_ready_message: '✅ Pedido pronto!',
      whatsapp_delivery_message: '🛵 Saiu para entrega!',
      whatsapp_completed_message: '🎉 Pedido entregue!',
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

// Formatar mensagem de notificação de pedido
function formatOrderNotification(
  customerName: string,
  orderId: string,
  orderItems: Array<{ name: string; quantity: number }>,
  orderTotal: number,
  status: string
): string {
  const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderTotal);
  const itemsList = orderItems.map(i => `  • ${i.quantity}x ${i.name}`).join('\n');
  
  if (status === 'pending' || status === 'new') {
    return `🎉 *Pedido Recebido!*\n\nOlá, ${customerName}! 👋\n\nRecebemos seu pedido e já estamos preparando!\n\n📝 *Itens do Pedido:*\n${itemsList}\n\n💰 *Total:* ${totalFormatted}\n\n⏳ Aguarde, em breve você receberá atualizações sobre seu pedido.\n\n❤️ Obrigado por escolher o INOVAFOOD!`;
  }
  
  return `📦 *Atualização do Pedido*\n\nOlá, ${customerName}!\n\n${STATUS_LABELS[status] || status}\n\n📝 Pedido: #${orderId.substring(0, 8)}\n💰 Total: ${totalFormatted}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;

    if (!body?.action) return json({ error: 'Missing action' }, 400);

    console.log(`Action received: ${body.action}`);

    if (body.action === 'status') {
      try {
        const r = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(5000) });
        const data = await r.json().catch(() => ({}));
        return json({ status: data.status ?? data.whatsapp ?? 'unknown' });
      } catch (e) {
        console.error('Status check failed:', e);
        return json({ status: 'offline', error: 'Could not reach WhatsApp API' });
      }
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

      const sent = await sendWhatsAppMessage(number, message);
      return json({ success: sent, message: sent ? 'Mensagem enviada' : 'Falha ao enviar' }, sent ? 200 : 500);
    }

    // Notificar cliente sobre pedido (chamado após criar pedido)
    if (body.action === 'notify_order') {
      const { customerPhone, customerName, orderId, orderItems, orderTotal, orderStatus } = body;
      
      if (!customerPhone) {
        return json({ error: 'Missing customerPhone' }, 400);
      }

      console.log(`Notifying order ${orderId} to ${customerPhone}`);

      const settings = await getStoreSettings();
      
      let message: string;
      
      // Usar mensagem personalizada ou gerar automática
      if (orderStatus === 'pending' || orderStatus === 'new') {
        message = formatOrderNotification(
          customerName || 'Cliente',
          orderId || '',
          orderItems || [],
          orderTotal || 0,
          'pending'
        );
      } else if (orderStatus === 'preparing') {
        message = settings.whatsapp_preparing_message.replace('{nome}', customerName || 'Cliente');
      } else if (orderStatus === 'ready') {
        message = settings.whatsapp_ready_message.replace('{nome}', customerName || 'Cliente');
      } else if (orderStatus === 'out_for_delivery') {
        message = settings.whatsapp_delivery_message.replace('{nome}', customerName || 'Cliente');
      } else if (orderStatus === 'completed') {
        message = settings.whatsapp_completed_message.replace('{nome}', customerName || 'Cliente');
      } else {
        message = formatOrderNotification(
          customerName || 'Cliente',
          orderId || '',
          orderItems || [],
          orderTotal || 0,
          orderStatus || 'pending'
        );
      }

      const sent = await sendWhatsAppMessage(customerPhone, message);
      
      return json({ 
        success: sent, 
        message: sent ? 'Notificação enviada' : 'Falha ao enviar notificação',
        phone: customerPhone,
        status: orderStatus
      });
    }

    // Webhook: called by WhatsApp bot when receiving a message
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
      
      // Enviar resposta de volta via API do WhatsApp
      const sent = await sendWhatsAppMessage(from, responseMessage);
      console.log(`Response sent to ${from}: ${sent}`);
      
      return json({ 
        success: sent,
        reply: responseMessage, // Para compatibilidade com whatsapp-web.js
        status: sent ? 'success' : 'failed',
        action: 'response_sent',
        to: from
      });
    }

    return json({ error: 'Invalid action' }, 400);
  } catch (e) {
    console.error('whatsapp-proxy error', e);
    return json({ error: 'Internal error', details: String(e) }, 500);
  }
});
