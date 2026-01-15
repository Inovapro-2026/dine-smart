import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Olá! 👋 Sou o assistente do restaurante. Posso ajudar com:\n\n• Recomendações de pratos\n• Informações sobre ingredientes\n• Status do seu pedido\n\nComo posso ajudar?'
  }
];

const QUICK_REPLIES = [
  '🍕 Qual pizza mais vendida?',
  '🥗 Opções vegetarianas?',
  '⏱️ Tempo de entrega?',
  '💰 Combos promocionais?',
];

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulated AI response (in production, call your AI endpoint)
    setTimeout(() => {
      const responses: Record<string, string> = {
        'pizza': '🍕 Nossa pizza mais vendida é a **Calabresa Especial**! Feita com calabresa artesanal, cebola caramelizada e molho especial da casa. R$ 45,90 na média.',
        'vegetariana': '🥗 Temos várias opções vegetarianas:\n\n• Salada Buddha Bowl - R$ 28,90\n• Pizza Margherita - R$ 42,90\n• Wrap de Legumes - R$ 24,90\n• Açaí Natural - R$ 19,90',
        'entrega': '⏱️ Nosso tempo médio de entrega é de **30-45 minutos**. Pedidos acima de R$ 50 têm frete grátis!',
        'combo': '💰 Combos do dia:\n\n• Combo Família: 2 pizzas + refrigerante 2L = R$ 79,90\n• Combo Lanche: Hambúrguer + Batata + Bebida = R$ 34,90\n• Combo Fit: Salada + Suco Natural = R$ 32,90',
      };

      let response = 'Entendi! Posso verificar isso para você. Gostaria de saber algo mais específico sobre nosso cardápio? 😊';
      
      const lowerText = messageText.toLowerCase();
      if (lowerText.includes('pizza')) response = responses.pizza;
      else if (lowerText.includes('vegetarian') || lowerText.includes('vegana') || lowerText.includes('salada')) response = responses.vegetariana;
      else if (lowerText.includes('entrega') || lowerText.includes('tempo') || lowerText.includes('demora')) response = responses.entrega;
      else if (lowerText.includes('combo') || lowerText.includes('promoç')) response = responses.combo;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center',
          'bg-gradient-to-br from-primary to-primary/80 text-white',
          'transition-all duration-300 hover:scale-110 hover:shadow-2xl',
          isOpen && 'rotate-180'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat window */}
      <div className={cn(
        'fixed bottom-40 right-4 z-50 w-[340px] sm:w-[380px] max-h-[500px] bg-background rounded-2xl shadow-2xl border overflow-hidden',
        'transition-all duration-300 origin-bottom-right',
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Assistente Virtual</h3>
              <p className="text-xs text-white/80">Online • Responde em segundos</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[280px] overflow-y-auto p-4 space-y-3 bg-secondary/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-2 animate-fade-in',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={cn(
                'max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line',
                message.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-background border rounded-bl-md'
              )}>
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-2 items-center animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-background border px-4 py-2 rounded-2xl rounded-bl-md">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        <div className="p-2 border-t bg-background/50 flex gap-2 overflow-x-auto scrollbar-hide">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              className="text-xs px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-background flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta..."
            className="flex-1 rounded-full text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            size="icon" 
            className="rounded-full shrink-0"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
