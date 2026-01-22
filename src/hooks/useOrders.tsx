import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InovaOrder, CartItem, OrderStatus } from '@/types/inovafood';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface CreateOrderData {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes?: string;
  payment_method?: string;
  store_id?: string;
}

export function useOrders(storeId?: string) {
  return useQuery({
    queryKey: ['inovafood-orders', storeId],
    queryFn: async (): Promise<InovaOrder[]> => {
      let query = supabase
        .from('inovafood_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return (data || []).map(order => ({
        ...order,
        items: (order.items as unknown) as CartItem[],
        status: order.status as OrderStatus,
      })) as InovaOrder[];
    },
    refetchInterval: 5000, // Atualiza a cada 5 segundos para tempo real
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData): Promise<InovaOrder> => {
      const insertData = {
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address,
        items: JSON.parse(JSON.stringify(data.items)) as Json,
        subtotal: data.subtotal,
        delivery_fee: data.delivery_fee,
        total: data.total,
        notes: data.notes || null,
        payment_method: data.payment_method || 'pix',
        store_id: data.store_id || null,
        status: 'pending',
      };

      const { data: order, error } = await supabase
        .from('inovafood_orders')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      // Enviar notificação WhatsApp para o cliente
      try {
        const orderItems = data.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity
        }));

        await supabase.functions.invoke('whatsapp-proxy', {
          body: {
            action: 'notify_order',
            customerPhone: data.customer_phone,
            customerName: data.customer_name,
            orderId: order.id,
            orderItems,
            orderTotal: data.total,
            orderStatus: 'pending'
          }
        });
        
        console.log('WhatsApp notification sent for order:', order.id);
      } catch (whatsappError) {
        // Não falha o pedido se o WhatsApp falhar
        console.error('Failed to send WhatsApp notification:', whatsappError);
      }

      return {
        ...order,
        items: (order.items as unknown) as CartItem[],
        status: order.status as OrderStatus,
      } as InovaOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inovafood-orders'] });
      toast.success('Pedido realizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido. Tente novamente.');
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, customerPhone, customerName }: { 
      orderId: string; 
      status: OrderStatus;
      customerPhone?: string;
      customerName?: string;
    }) => {
      // Use maybeSingle() to avoid PGRST116 when RLS prevents returning rows
      const { data, error } = await supabase
        .from('inovafood_orders')
        .update({ status })
        .eq('id', orderId)
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      // Enviar notificação WhatsApp se tivermos o telefone
      const phone = customerPhone || data?.customer_phone;
      const name = customerName || data?.customer_name;
      
      if (phone && status !== 'cancelled') {
        try {
          await supabase.functions.invoke('whatsapp-proxy', {
            body: {
              action: 'notify_order',
              customerPhone: phone,
              customerName: name,
              orderId,
              orderTotal: data?.total || 0,
              orderStatus: status
            }
          });
          console.log('WhatsApp status notification sent:', status);
        } catch (whatsappError) {
          console.error('Failed to send WhatsApp status notification:', whatsappError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inovafood-orders'] });
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status do pedido.');
    },
  });
}

export function useTodayOrders() {
  return useQuery({
    queryKey: ['inovafood-orders-today'],
    queryFn: async (): Promise<InovaOrder[]> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('inovafood_orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching today orders:', error);
        throw error;
      }

      return (data || []).map(order => ({
        ...order,
        items: (order.items as unknown) as CartItem[],
        status: order.status as OrderStatus,
      })) as InovaOrder[];
    },
    refetchInterval: 5000,
  });
}
