import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppStatus {
  connected: boolean;
}

export function useWhatsApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = async (): Promise<WhatsAppStatus> => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-proxy', {
        body: { action: 'status' },
      });
      if (error) throw error;

      const connected = data?.status === 'open';
      setIsConnected(connected);
      return { connected };
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setIsConnected(false);
      return { connected: false };
    }
  };

  const extractQrSrcFromHtml = (html: string): string | null => {
    const srcMatch = html.match(/src\s*=\s*['\"]([^'\"]+)['\"]/i);
    if (srcMatch?.[1]) return srcMatch[1];

    const b64Match = html.match(/base64,([A-Za-z0-9+/=]+)\s*/i);
    if (b64Match?.[1]) return `data:image/png;base64,${b64Match[1]}`;

    const rawB64 = html.trim();
    if (/^[A-Za-z0-9+/=]+$/.test(rawB64) && rawB64.length > 200) {
      return `data:image/png;base64,${rawB64}`;
    }

    return null;
  };

  const generateQRCode = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-proxy', {
        body: { action: 'qr' },
      });
      if (error) throw error;

      const qr = (data as any)?.qr ?? null;
      if (qr) {
        setQrCode(qr);
        return qr;
      }

      // If API says it's already connected, don't show an error.
      const raw = (data as any)?.raw;
      if (typeof raw === 'string' && raw) {
        try {
          const parsed = JSON.parse(raw);
          const msg = String(parsed?.message ?? '').toLowerCase();
          if (parsed?.status === 'connected' || msg.includes('conect')) {
            setIsConnected(true);
            toast.success('WhatsApp já está conectado.');
            return null;
          }
        } catch {
          // not JSON
        }

        const extracted = extractQrSrcFromHtml(raw);
        if (extracted) {
          setQrCode(extracted);
          return extracted;
        }
      }

      toast.error('QR Code não retornou no formato esperado.');
      return null;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Erro ao gerar QR Code. Verifique a conexão com o servidor.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (number: string, message: string): Promise<boolean> => {
    try {
      // Formatar número (remover caracteres especiais e adicionar 55 se necessário)
      let formattedNumber = number.replace(/\D/g, '');
      if (!formattedNumber.startsWith('55')) {
        formattedNumber = '55' + formattedNumber;
      }

      const { data, error } = await supabase.functions.invoke('whatsapp-proxy', {
        body: { action: 'send', number: formattedNumber, message },
      });
      if (error) throw error;

      return data?.status === 'success';
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  };

  return {
    isConnected,
    qrCode,
    isLoading,
    checkStatus,
    generateQRCode,
    sendMessage,
  };
}
