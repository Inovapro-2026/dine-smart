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
        <CardContent className="p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">{order.customer_name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="font-bold text-primary text-xs sm:text-sm shrink-0">
              {formatCurrency(order.total)}
            </Badge>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-1 mb-2 sm:mb-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{order.customer_address}</span>
            </div>
          </div>

          <Separator className="my-2 sm:my-3" />

          {/* Items */}
          <div className="space-y-1 mb-2 sm:mb-3 max-h-24 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs sm:text-sm">
                <span className="truncate mr-2">{item.quantity}x {item.product.name}</span>
                <span className="text-muted-foreground shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="bg-warning/10 text-warning-foreground text-xs sm:text-sm p-2 rounded-lg mb-2 sm:mb-3">
              📝 {order.notes}
            </div>
          )}

          {/* Action Button */}
          {nextStatus && (
            <Button 
              className="w-full h-10 sm:h-12 text-sm sm:text-lg"
              onClick={() => handleAdvanceOrder(order)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <>
                  <span className="truncate">PRÓXIMO: {ORDER_STATUS_LABELS[nextStatus]}</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 shrink-0" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const StatusTab = ({ status, icon: Icon, orders }: { status: OrderStatus, icon: React.ElementType, orders: InovaOrder[] }) => (
    <div className="space-y-3 sm:space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <Icon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm sm:text-base">Nenhum pedido {ORDER_STATUS_LABELS[status].toLowerCase()}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Gestão de Pedidos</h1>
        <p className="text-sm text-muted-foreground">PDV em tempo real</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-auto p-1">
          <TabsTrigger value="pending" className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs hidden xs:inline">Pendentes</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-1.5">{ordersByStatus.pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="preparing" className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1">
            <ChefHat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs hidden xs:inline">Preparando</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-1.5">{ordersByStatus.preparing.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1">
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs hidden xs:inline">Pronto</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-1.5">{ordersByStatus.ready.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="out_for_delivery" className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1">
            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs hidden xs:inline">Entrega</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-1.5">{ordersByStatus.out_for_delivery.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1">
            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs hidden xs:inline">Concluídos</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-1.5">{ordersByStatus.completed.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 sm:mt-6">
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
