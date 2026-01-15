import { useState, useEffect } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  QrCode, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Send,
  Settings,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminWhatsApp() {
  const { isConnected, qrCode, isLoading, checkStatus, generateQRCode, sendMessage } = useWhatsApp();
  const [isChecking, setIsChecking] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('🧪 Teste de mensagem do INOVAFOOD!');
  const [isSending, setIsSending] = useState(false);

  const [messages, setMessages] = useState({
    welcome: '👋 Bem-vindo ao INOVAFOOD!\nEscolha uma opção abaixo 👇\n\n1️⃣ Ver cardápio\n2️⃣ Falar com atendente\n3️⃣ Ver meu pedido\n4️⃣ Horário de funcionamento',
    preparing: '🍳 Seu pedido está sendo preparado!',
    ready: '✅ Seu pedido está pronto para retirada!',
    delivery: '🛵 Seu pedido saiu para entrega!',
    completed: '🎉 Pedido entregue! Obrigado pela preferência!',
  });

  useEffect(() => {
    handleCheckStatus();
  }, []);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    await checkStatus();
    setIsChecking(false);
  };

  const handleGenerateQR = async () => {
    const qr = await generateQRCode();
    if (qr) {
      toast.success('QR Code gerado! Escaneie com o WhatsApp.');
    }
  };

  const handleSendTest = async () => {
    if (!testNumber) {
      toast.error('Digite um número de telefone');
      return;
    }

    setIsSending(true);
    const sent = await sendMessage(testNumber, testMessage);
    setIsSending(false);

    if (sent) {
      toast.success('Mensagem de teste enviada!');
    } else {
      toast.error('Erro ao enviar mensagem. Verifique a conexão.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Integração WhatsApp</h1>
        <p className="text-sm text-muted-foreground">Conecte e configure automações</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Status e Conexão */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              Status da Conexão
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Conecte seu WhatsApp para automações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-secondary/50 rounded-lg sm:rounded-xl gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {isConnected ? (
                  <Wifi className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                ) : (
                  <WifiOff className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                )}
                <div>
                  <p className="font-medium text-sm sm:text-base">WhatsApp</p>
                  <Badge variant={isConnected ? 'default' : 'destructive'} className="mt-1 text-[10px] sm:text-xs">
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={handleCheckStatus}
                disabled={isChecking}
              >
                <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isChecking ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <Separator />

            {/* QR Code */}
            <div className="space-y-3">
              <Button 
                className="w-full text-sm sm:text-base" 
                onClick={handleGenerateQR}
                disabled={isLoading || isConnected}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4 mr-2" />
                )}
                {isConnected ? 'Já Conectado' : 'Gerar QR Code'}
              </Button>

              {qrCode && !isConnected && (
                <div className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                    alt="QR Code WhatsApp"
                    className="w-36 h-36 sm:w-48 sm:h-48"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
                    Escaneie com o WhatsApp
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teste de Mensagem */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              Testar Envio
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Envie uma mensagem de teste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testNumber" className="text-xs sm:text-sm">Número de telefone</Label>
              <Input
                id="testNumber"
                placeholder="(00) 00000-0000"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testMessage" className="text-xs sm:text-sm">Mensagem</Label>
              <Textarea
                id="testMessage"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            <Button 
              className="w-full text-sm sm:text-base" 
              onClick={handleSendTest}
              disabled={isSending || !isConnected}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Teste
            </Button>

            {!isConnected && (
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Conecte o WhatsApp primeiro para enviar mensagens
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuração de Mensagens */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            Mensagens Automáticas
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configure as mensagens enviadas em cada etapa do pedido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="msgWelcome" className="text-xs sm:text-sm">Mensagem de Boas-vindas</Label>
              <Textarea
                id="msgWelcome"
                value={messages.welcome}
                onChange={(e) => setMessages({ ...messages, welcome: e.target.value })}
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msgPreparing" className="text-xs sm:text-sm">Pedido em Preparo</Label>
              <Textarea
                id="msgPreparing"
                value={messages.preparing}
                onChange={(e) => setMessages({ ...messages, preparing: e.target.value })}
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msgReady" className="text-xs sm:text-sm">Pronto para Retirada</Label>
              <Textarea
                id="msgReady"
                value={messages.ready}
                onChange={(e) => setMessages({ ...messages, ready: e.target.value })}
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msgDelivery" className="text-xs sm:text-sm">Saiu para Entrega</Label>
              <Textarea
                id="msgDelivery"
                value={messages.delivery}
                onChange={(e) => setMessages({ ...messages, delivery: e.target.value })}
                rows={4}
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="msgCompleted" className="text-xs sm:text-sm">Pedido Concluído</Label>
            <Textarea
              id="msgCompleted"
              value={messages.completed}
              onChange={(e) => setMessages({ ...messages, completed: e.target.value })}
              rows={2}
              className="text-sm"
            />
          </div>

          <Button className="w-full sm:w-auto text-sm sm:text-base">
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
