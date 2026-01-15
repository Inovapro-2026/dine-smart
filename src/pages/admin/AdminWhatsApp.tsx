import { useState, useEffect } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  Settings,
  Loader2,
  Save,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminWhatsApp() {
  const { isConnected, qrCode, isLoading, checkStatus, generateQRCode, sendMessage } = useWhatsApp();
  const { settings, isLoading: isLoadingSettings, updateSettings, isSaving } = useStoreSettings();
  
  const [isChecking, setIsChecking] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('🧪 Teste de mensagem do INOVAFOOD!');
  const [isSending, setIsSending] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const [messages, setMessages] = useState({
    welcome: '',
    preparing: '',
    ready: '',
    delivery: '',
    completed: '',
  });

  // Sync local state with settings from database
  useEffect(() => {
    if (!isLoadingSettings && settings) {
      setMessages({
        welcome: settings.whatsapp_welcome_message,
        preparing: settings.whatsapp_preparing_message,
        ready: settings.whatsapp_ready_message,
        delivery: settings.whatsapp_delivery_message,
        completed: settings.whatsapp_completed_message,
      });
    }
  }, [settings, isLoadingSettings]);

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
      setIsQrOpen(true);
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

  const handleSaveMessages = async () => {
    await updateSettings({
      whatsapp_welcome_message: messages.welcome,
      whatsapp_preparing_message: messages.preparing,
      whatsapp_ready_message: messages.ready,
      whatsapp_delivery_message: messages.delivery,
      whatsapp_completed_message: messages.completed,
    });
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

              {!isConnected && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Ao gerar, o QR Code abrirá em um popout para escanear no WhatsApp.
                </p>
              )}

              <Dialog open={isQrOpen && !!qrCode && !isConnected} onOpenChange={setIsQrOpen}>
                <DialogContent className="max-w-[92vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Escaneie o QR Code</DialogTitle>
                    <DialogDescription>
                      Abra o WhatsApp no celular → Aparelhos conectados → Conectar um aparelho.
                    </DialogDescription>
                  </DialogHeader>

                  {qrCode ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={qrCode}
                        alt="QR Code do WhatsApp para conexão"
                        className="w-56 h-56 sm:w-72 sm:h-72"
                      />
                      <Button variant="outline" onClick={handleGenerateQR} disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Gerar novo QR
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum QR Code disponível.</p>
                  )}
                </DialogContent>
              </Dialog>
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
            Configure as mensagens enviadas em cada etapa do pedido. Clique em "Salvar" para aplicar as alterações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="msgWelcome" className="text-xs sm:text-sm flex items-center gap-2">
                Mensagem de Boas-vindas
                <Badge variant="outline" className="text-[10px]">Webhook</Badge>
              </Label>
              <Textarea
                id="msgWelcome"
                value={messages.welcome}
                onChange={(e) => setMessages({ ...messages, welcome: e.target.value })}
                rows={4}
                className="text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Enviada quando cliente manda primeira mensagem (requer webhook na API ISA)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="msgPreparing" className="text-xs sm:text-sm flex items-center gap-2">
                Pedido em Preparo
                <CheckCircle className="h-3 w-3 text-success" />
              </Label>
              <Textarea
                id="msgPreparing"
                value={messages.preparing}
                onChange={(e) => setMessages({ ...messages, preparing: e.target.value })}
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msgReady" className="text-xs sm:text-sm flex items-center gap-2">
                Pronto para Retirada
                <CheckCircle className="h-3 w-3 text-success" />
              </Label>
              <Textarea
                id="msgReady"
                value={messages.ready}
                onChange={(e) => setMessages({ ...messages, ready: e.target.value })}
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msgDelivery" className="text-xs sm:text-sm flex items-center gap-2">
                Saiu para Entrega
                <CheckCircle className="h-3 w-3 text-success" />
              </Label>
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
            <Label htmlFor="msgCompleted" className="text-xs sm:text-sm flex items-center gap-2">
              Pedido Concluído
              <CheckCircle className="h-3 w-3 text-success" />
            </Label>
            <Textarea
              id="msgCompleted"
              value={messages.completed}
              onChange={(e) => setMessages({ ...messages, completed: e.target.value })}
              rows={2}
              className="text-sm"
            />
          </div>

          <Button 
            className="w-full sm:w-auto text-sm sm:text-base" 
            onClick={handleSaveMessages}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Info sobre webhook */}
      <Card className="border-dashed">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Sobre mensagens automáticas</p>
              <p className="text-xs text-muted-foreground">
                <strong>Mensagens de status</strong> (Preparo, Pronto, Entrega, Concluído) são enviadas automaticamente quando você avança o pedido no painel.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Mensagem de boas-vindas</strong> precisa que sua API ISA/Baileys tenha webhook configurado para receber mensagens e chamar nosso endpoint.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
