import { useTodayOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Package
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: orders, isLoading } = useTodayOrders();

  const stats = {
    totalSales: orders?.reduce((sum, o) => sum + o.total, 0) || 0,
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
    completedOrders: orders?.filter(o => o.status === 'completed').length || 0,
    averageTicket: orders?.length ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length) : 0,
    preparingOrders: orders?.filter(o => o.status === 'preparing').length || 0,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio hoje</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-success/20 rounded-lg sm:rounded-xl">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Faturamento</p>
                {isLoading ? (
                  <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
                ) : (
                  <p className="text-sm sm:text-lg font-bold truncate">{formatCurrency(stats.totalSales)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg sm:rounded-xl">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Pedidos</p>
                {isLoading ? (
                  <Skeleton className="h-5 sm:h-6 w-8 sm:w-10" />
                ) : (
                  <p className="text-sm sm:text-lg font-bold">{stats.totalOrders}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-warning/20 rounded-lg sm:rounded-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Pendentes</p>
                {isLoading ? (
                  <Skeleton className="h-5 sm:h-6 w-8 sm:w-10" />
                ) : (
                  <p className="text-sm sm:text-lg font-bold">{stats.pendingOrders}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-info/20 rounded-lg sm:rounded-xl">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Preparando</p>
                {isLoading ? (
                  <Skeleton className="h-5 sm:h-6 w-8 sm:w-10" />
                ) : (
                  <p className="text-sm sm:text-lg font-bold">{stats.preparingOrders}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-success/20 rounded-lg sm:rounded-xl">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Concluídos</p>
                {isLoading ? (
                  <Skeleton className="h-5 sm:h-6 w-8 sm:w-10" />
                ) : (
                  <p className="text-sm sm:text-lg font-bold">{stats.completedOrders}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-accent rounded-lg sm:rounded-xl">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Ticket Médio</p>
                {isLoading ? (
                  <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
                ) : (
                  <p className="text-sm sm:text-lg font-bold truncate">{formatCurrency(stats.averageTicket)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 sm:h-16 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum pedido hoje ainda</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 sm:p-4 bg-secondary/50 rounded-lg sm:rounded-xl gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-xs sm:text-sm">
                        {order.customer_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{order.customer_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {order.items.length} itens • {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary text-sm sm:text-base">{formatCurrency(order.total)}</p>
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-warning/20 text-warning' :
                      order.status === 'preparing' ? 'bg-info/20 text-info' :
                      order.status === 'completed' ? 'bg-success/20 text-success' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {order.status === 'pending' ? 'Pendente' :
                       order.status === 'preparing' ? 'Preparando' :
                       order.status === 'ready' ? 'Pronto' :
                       order.status === 'out_for_delivery' ? 'Entrega' :
                       order.status === 'completed' ? 'Concluído' : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
