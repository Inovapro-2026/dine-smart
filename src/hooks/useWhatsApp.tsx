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

  const generateQRCode = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-proxy', {
        body: { action: 'qr' },
      });
      if (error) throw error;

      const qr = data?.qr ?? null;
      if (qr) {
        setQrCode(qr);
        return qr;
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
