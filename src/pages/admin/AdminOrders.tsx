import { useTodayOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { InovaOrder, ORDER_STATUS_LABELS, OrderStatus } from '@/types/inovafood';
import { Card, CardContent } from '@/components/ui/card';
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
  Loader2,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Timer,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const STATUS_FLOW: OrderStatus[] = ['pending', 'preparing', 'ready', 'out_for_delivery', 'completed'];

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: '',
  preparing: '🍳 Seu pedido está sendo preparado!',
  ready: '✅ Seu pedido está pronto para retirada!',
  out_for_delivery: '🛵 Seu pedido saiu para entrega!',
  completed: '🎉 Pedido entregue! Obrigado pela preferência!',
  cancelled: '❌ Seu pedido foi cancelado.',
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  preparing: '#3b82f6',
  ready: '#22c55e',
  out_for_delivery: '#8b5cf6',
  completed: '#6b7280',
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useTodayOrders();
  const updateStatus = useUpdateOrderStatus();
  const { sendMessage } = useWhatsApp();
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  const ordersByStatus = useMemo(() => ({
    pending: orders?.filter(o => o.status === 'pending') || [],
    preparing: orders?.filter(o => o.status === 'preparing') || [],
    ready: orders?.filter(o => o.status === 'ready') || [],
    out_for_delivery: orders?.filter(o => o.status === 'out_for_delivery') || [],
    completed: orders?.filter(o => o.status === 'completed') || [],
  }), [orders]);

  const stats = useMemo(() => {
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((acc, o) => acc + o.total, 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const activeOrders = (ordersByStatus.pending.length + ordersByStatus.preparing.length + 
                         ordersByStatus.ready.length + ordersByStatus.out_for_delivery.length);
    return { totalOrders, totalRevenue, avgOrderValue, activeOrders };
  }, [orders, ordersByStatus]);

  const pieData = useMemo(() => [
    { name: 'Pendentes', value: ordersByStatus.pending.length, color: STATUS_COLORS.pending },
    { name: 'Preparando', value: ordersByStatus.preparing.length, color: STATUS_COLORS.preparing },
    { name: 'Prontos', value: ordersByStatus.ready.length, color: STATUS_COLORS.ready },
    { name: 'Entrega', value: ordersByStatus.out_for_delivery.length, color: STATUS_COLORS.out_for_delivery },
    { name: 'Concluídos', value: ordersByStatus.completed.length, color: STATUS_COLORS.completed },
  ].filter(d => d.value > 0), [ordersByStatus]);

  const hourlyData = useMemo(() => {
    const hours: Record<number, number> = {};
    orders?.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });

    return Object.entries(hours)
      .map(([hour, count]) => ({ hour: `${Number(hour)}h`, pedidos: count }))
      .sort((a, b) => Number(a.hour.replace('h', '')) - Number(b.hour.replace('h', '')));
  }, [orders]);

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

  const StatCard = ({ icon: Icon, label, value, subValue, color }: { 
    icon: React.ElementType; 
    label: string; 
    value: string; 
    subValue?: string;
    color: string;
  }) => (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-xl sm:text-2xl font-bold gradient-text">{value}</p>
          {subValue && (
            <p className="text-xs text-muted-foreground">{subValue}</p>
          )}
        </div>
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  );

  const OrderCard = ({ order }: { order: InovaOrder }) => {
    const nextStatus = getNextStatus(order.status);
    const isProcessing = processingOrder === order.id;
    const statusColor = STATUS_COLORS[order.status];

    return (
      <div className="order-card-enhanced animate-fade-in">
        {/* Status indicator bar */}
        <div 
          className="h-1 w-full" 
          style={{ background: `linear-gradient(90deg, ${statusColor}, ${statusColor}80)` }}
        />
        
        <div className="p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 status-indicator"
                style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm sm:text-base truncate">{order.customer_name}</p>
                <div className="flex items-center gap-2">
                  <Timer className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge 
                className="font-bold text-sm px-3 py-1"
                style={{ backgroundColor: `${statusColor}20`, color: statusColor, border: 'none' }}
              >
                {formatCurrency(order.total)}
              </Badge>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-1.5 mb-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{order.customer_address}</span>
            </div>
          </div>

          <Separator className="my-3 bg-border/50" />

          {/* Items */}
          <div className="space-y-1.5 mb-3 max-h-28 overflow-y-auto scrollbar-thin">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs sm:text-sm py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="truncate mr-2 font-medium">
                  <span className="text-admin-primary font-bold">{item.quantity}x</span> {item.product.name}
                </span>
                <span className="text-muted-foreground shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="bg-warning/10 text-warning border border-warning/20 text-xs sm:text-sm p-2.5 rounded-xl mb-3 flex items-start gap-2">
              <span className="text-base">📝</span>
              <span>{order.notes}</span>
            </div>
          )}

          {/* Action Button */}
          {nextStatus && (
            <Button 
              className="w-full h-11 sm:h-14 text-sm sm:text-base font-bold bg-gradient-to-r from-admin-primary to-admin-secondary hover:from-admin-secondary hover:to-admin-primary transition-all duration-500 shadow-lg hover:shadow-admin-primary/30"
              onClick={() => handleAdvanceOrder(order)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="truncate">AVANÇAR: {ORDER_STATUS_LABELS[nextStatus]}</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 shrink-0" />
                </>
              )}
            </Button>
          )}

          {order.status === 'completed' && (
            <div className="flex items-center justify-center gap-2 py-3 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium text-sm">Pedido Concluído</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const StatusTab = ({ status, icon: Icon, orders }: { status: OrderStatus; icon: React.ElementType; orders: InovaOrder[] }) => (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${STATUS_COLORS[status]}15` }}
          >
            <Icon className="h-8 w-8 sm:h-10 sm:w-10 opacity-50" style={{ color: STATUS_COLORS[status] }} />
          </div>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            Nenhum pedido {ORDER_STATUS_LABELS[status].toLowerCase()}
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Os pedidos aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="admin-bg-animated min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-admin-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bg-animated admin-no-motion p-4 sm:p-6 relative overflow-x-hidden rounded-2xl">
      <div className="relative z-10 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Gestão de Pedidos</h1>
            <p className="text-sm text-muted-foreground mt-1">PDV em tempo real • Hoje</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Atualização automática</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            icon={ShoppingBag} 
            label="Pedidos Hoje" 
            value={stats.totalOrders.toString()} 
            subValue={`${stats.activeOrders} ativos`}
            color="#3b82f6"
          />
          <StatCard 
            icon={DollarSign} 
            label="Faturamento" 
            value={formatCurrency(stats.totalRevenue)}
            color="#22c55e" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="Ticket Médio" 
            value={formatCurrency(stats.avgOrderValue)}
            color="#8b5cf6"
          />
          <StatCard 
            icon={Zap} 
            label="Em Andamento" 
            value={stats.activeOrders.toString()}
            subValue="aguardando ação"
            color="#f59e0b"
          />
        </div>

        {/* Charts Row */}
        {(pieData.length > 0 || hourlyData.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie Chart */}
            {pieData.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Distribuição por Status</h3>
                  <div className="h-40 sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                          isAnimationActive={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-3">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-muted-foreground">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Area Chart */}
            {hourlyData.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Pedidos por Hora</h3>
                  <div className="h-40 sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData}>
                        <defs>
                          <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--admin-primary))" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="hsl(var(--admin-primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="pedidos" 
                          stroke="hsl(var(--admin-primary))" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorPedidos)"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Orders Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-5 w-full h-auto p-1.5 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
            {[
              { value: 'pending', icon: Clock, label: 'Pendentes', count: ordersByStatus.pending.length },
              { value: 'preparing', icon: ChefHat, label: 'Preparando', count: ordersByStatus.preparing.length },
              { value: 'ready', icon: Package, label: 'Pronto', count: ordersByStatus.ready.length },
              { value: 'out_for_delivery', icon: Truck, label: 'Entrega', count: ordersByStatus.out_for_delivery.length },
              { value: 'completed', icon: CheckCircle, label: 'Concluídos', count: ordersByStatus.completed.length },
            ].map(({ value, icon: Icon, label, count }) => (
              <TabsTrigger 
                key={value}
                value={value} 
                className="tab-glow flex flex-col gap-1 py-2.5 sm:py-3 px-1 data-[state=active]:bg-background/80 data-[state=active]:shadow-md rounded-lg transition-all"
              >
                <div 
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mx-auto transition-colors"
                  style={{ 
                    backgroundColor: `${STATUS_COLORS[value as OrderStatus]}15`,
                    color: STATUS_COLORS[value as OrderStatus]
                  }}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">{label}</span>
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 font-bold"
                  style={{ 
                    backgroundColor: count > 0 ? `${STATUS_COLORS[value as OrderStatus]}20` : undefined,
                    color: count > 0 ? STATUS_COLORS[value as OrderStatus] : undefined
                  }}
                >
                  {count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-5 sm:mt-6">
            <TabsContent value="pending" className="mt-0">
              <StatusTab status="pending" icon={Clock} orders={ordersByStatus.pending} />
            </TabsContent>
            <TabsContent value="preparing" className="mt-0">
              <StatusTab status="preparing" icon={ChefHat} orders={ordersByStatus.preparing} />
            </TabsContent>
            <TabsContent value="ready" className="mt-0">
              <StatusTab status="ready" icon={Package} orders={ordersByStatus.ready} />
            </TabsContent>
            <TabsContent value="out_for_delivery" className="mt-0">
              <StatusTab status="out_for_delivery" icon={Truck} orders={ordersByStatus.out_for_delivery} />
            </TabsContent>
            <TabsContent value="completed" className="mt-0">
              <StatusTab status="completed" icon={CheckCircle} orders={ordersByStatus.completed} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
