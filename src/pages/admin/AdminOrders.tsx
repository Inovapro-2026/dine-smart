import { useTodayOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { InovaOrder, ORDER_STATUS_LABELS, OrderStatus } from '@/types/inovafood';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  ChefHat, 
  Package, 
  Truck, 
  CheckCircle,
  User,
  MapPin,
  Phone,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const STATUS_FLOW: OrderStatus[] = ['pending', 'preparing', 'ready', 'out_for_delivery', 'completed'];

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: '',
  preparing: '🍳 Seu pedido está sendo preparado!',
  ready: '✅ Seu pedido está pronto para retirada!',
  out_for_delivery: '🛵 Seu pedido saiu para entrega!',
  completed: '🎉 Pedido entregue! Obrigado pela preferência!',
  cancelled: '❌ Seu pedido foi cancelado.',
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useTodayOrders();
  const updateStatus = useUpdateOrderStatus();
  const { sendMessage } = useWhatsApp();
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  const ordersByStatus = {
    pending: orders?.filter(o => o.status === 'pending') || [],
    preparing: orders?.filter(o => o.status === 'preparing') || [],
    ready: orders?.filter(o => o.status === 'ready') || [],
    out_for_delivery: orders?.filter(o => o.status === 'out_for_delivery') || [],
    completed: orders?.filter(o => o.status === 'completed') || [],
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[currentIndex + 1];
  };

  const handleAdvanceOrder = async (order: InovaOrder) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    setProcessingOrder(order.id);

    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: nextStatus });

      // Enviar mensagem WhatsApp
      const message = STATUS_MESSAGES[nextStatus];
      if (message && order.customer_phone) {
        const sent = await sendMessage(order.customer_phone, message);
        if (sent) {
          toast.success('WhatsApp enviado com sucesso!');
        }
      }

      toast.success(`Pedido movido para ${ORDER_STATUS_LABELS[nextStatus]}`);
    } catch (error) {
      console.error('Error advancing order:', error);
      toast.error('Erro ao atualizar pedido');
    } finally {
      setProcessingOrder(null);
    }
  };

  const OrderCard = ({ order }: { order: InovaOrder }) => {
    const nextStatus = getNextStatus(order.status);
    const isProcessing = processingOrder === order.id;

    return (
      <Card className="animate-slide-up">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{order.customer_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="font-bold text-primary">
              {formatCurrency(order.total)}
            </Badge>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-2 mb-3 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3" />
              {order.customer_phone}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{order.customer_address}</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Items */}
          <div className="space-y-1 mb-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.product.name}</span>
                <span className="text-muted-foreground">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="bg-warning/10 text-warning-foreground text-sm p-2 rounded-lg mb-3">
              📝 {order.notes}
            </div>
          )}

          {/* Action Button */}
          {nextStatus && (
            <Button 
              className="w-full h-12 text-lg"
              onClick={() => handleAdvanceOrder(order)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  PRÓXIMO: {ORDER_STATUS_LABELS[nextStatus]}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const StatusTab = ({ status, icon: Icon, orders }: { status: OrderStatus, icon: React.ElementType, orders: InovaOrder[] }) => (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum pedido {ORDER_STATUS_LABELS[status].toLowerCase()}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Pedidos</h1>
        <p className="text-muted-foreground">PDV em tempo real</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-auto">
          <TabsTrigger value="pending" className="flex flex-col gap-1 py-3">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Pendentes</span>
            <Badge variant="secondary" className="text-xs">{ordersByStatus.pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="preparing" className="flex flex-col gap-1 py-3">
            <ChefHat className="h-4 w-4" />
            <span className="text-xs">Preparando</span>
            <Badge variant="secondary" className="text-xs">{ordersByStatus.preparing.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex flex-col gap-1 py-3">
            <Package className="h-4 w-4" />
            <span className="text-xs">Pronto</span>
            <Badge variant="secondary" className="text-xs">{ordersByStatus.ready.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="out_for_delivery" className="flex flex-col gap-1 py-3">
            <Truck className="h-4 w-4" />
            <span className="text-xs">Entrega</span>
            <Badge variant="secondary" className="text-xs">{ordersByStatus.out_for_delivery.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex flex-col gap-1 py-3">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Concluídos</span>
            <Badge variant="secondary" className="text-xs">{ordersByStatus.completed.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="pending">
            <StatusTab status="pending" icon={Clock} orders={ordersByStatus.pending} />
          </TabsContent>
          <TabsContent value="preparing">
            <StatusTab status="preparing" icon={ChefHat} orders={ordersByStatus.preparing} />
          </TabsContent>
          <TabsContent value="ready">
            <StatusTab status="ready" icon={Package} orders={ordersByStatus.ready} />
          </TabsContent>
          <TabsContent value="out_for_delivery">
            <StatusTab status="out_for_delivery" icon={Truck} orders={ordersByStatus.out_for_delivery} />
          </TabsContent>
          <TabsContent value="completed">
            <StatusTab status="completed" icon={CheckCircle} orders={ordersByStatus.completed} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
