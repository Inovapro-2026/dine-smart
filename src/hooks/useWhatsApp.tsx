import { useState } from 'react';
import { toast } from 'sonner';

const WHATSAPP_API_BASE = 'http://148.230.76.60:3333';

interface WhatsAppStatus {
  connected: boolean;
  number?: string;
}

export function useWhatsApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = async (): Promise<WhatsAppStatus> => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/status`);
      const data = await response.json();
      setIsConnected(data.connected || false);
      return data;
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setIsConnected(false);
      return { connected: false };
    }
  };

  const generateQRCode = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/qr`);
      const data = await response.json();
      
      if (data.qr) {
        setQrCode(data.qr);
        return data.qr;
      }
      
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

      const response = await fetch(`${WHATSAPP_API_BASE}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: formattedNumber,
          message,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return true;
      }
      
      console.error('WhatsApp send error:', data);
      return false;
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
