import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrders';
import { CustomerData } from '@/types/inovafood';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { User, Phone, MapPin, CreditCard, Banknote, Smartphone, Check, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryFee: number;
}

export function CheckoutModal({ isOpen, onClose, deliveryFee }: CheckoutModalProps) {
  const { items, getTotal, clearCart } = useCart();
  const createOrder = useCreateOrder();
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [notes, setNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = getTotal();
  const total = subtotal + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerData.name || !customerData.phone || !customerData.address) {
      return;
    }

    try {
      await createOrder.mutateAsync({
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        notes: notes || undefined,
        payment_method: paymentMethod,
      });

      setOrderSuccess(true);
      clearCart();
      
      setTimeout(() => {
        setOrderSuccess(false);
        onClose();
        setCustomerData({ name: '', phone: '', address: '' });
        setNotes('');
      }, 3000);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  if (orderSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-4 animate-bounce-in">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pedido Confirmado!</h2>
            <p className="text-muted-foreground">
              Você receberá atualizações pelo WhatsApp.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do cliente */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Seus Dados
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    className="pl-10"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: formatPhone(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço completo *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    placeholder="Rua, número, bairro, complemento..."
                    className="pl-10 min-h-[80px]"
                    value={customerData.address}
                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Forma de pagamento */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Forma de Pagamento
            </h3>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-3">
              <Label
                htmlFor="pix"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="pix" id="pix" className="sr-only" />
                <Smartphone className="h-6 w-6" />
                <span className="text-sm font-medium">PIX</span>
              </Label>

              <Label
                htmlFor="money"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'money' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="money" id="money" className="sr-only" />
                <Banknote className="h-6 w-6" />
                <span className="text-sm font-medium">Dinheiro</span>
              </Label>

              <Label
                htmlFor="card"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="card" id="card" className="sr-only" />
                <CreditCard className="h-6 w-6" />
                <span className="text-sm font-medium">Cartão</span>
              </Label>
            </RadioGroup>
          </div>

          <Separator />

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Sem cebola, troco para R$50..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Separator />

          {/* Resumo */}
          <div className="space-y-2 bg-secondary/50 p-4 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({items.length} itens)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de entrega</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg"
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>Confirmar Pedido - {formatPrice(total)}</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
