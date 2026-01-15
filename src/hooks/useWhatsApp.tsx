import { useState } from 'react';
import { toast } from 'sonner';

const WHATSAPP_API_BASE = 'http://148.230.76.60:3334';

interface WhatsAppStatus {
  connected: boolean;
}

export function useWhatsApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = async (): Promise<WhatsAppStatus> => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/status`);
      const data = await response.json();
      // API retorna { status: "open" } ou { status: "close" }
      const connected = data.status === 'open';
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
      const response = await fetch(`${WHATSAPP_API_BASE}/qr`);
      // API retorna HTML <img> com base64
      const htmlText = await response.text();
      
      // Extrair src do base64 da tag img
      const srcMatch = htmlText.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        const base64Src = srcMatch[1];
        setQrCode(base64Src);
        return base64Src;
      }
      
      // Se não conseguir extrair, retorna o texto completo
      setQrCode(htmlText);
      return htmlText;
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
      
      // API retorna { status: "success", message: "Mensagem enviada!" }
      if (data.status === 'success') {
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
