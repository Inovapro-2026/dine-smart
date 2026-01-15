export interface InovaProduct {
  id: string;
  store_id: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
  category?: InovaCategory;
}

export interface InovaCategory {
  id: string;
  store_id: string | null;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface InovaOrder {
  id: string;
  store_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: InovaProduct;
  quantity: number;
}

export interface StoreSettings {
  id: string;
  store_id: string | null;
  delivery_fee: number;
  min_order_value: number;
  opening_hours: OpeningHours;
  whatsapp_welcome_message: string;
  whatsapp_preparing_message: string;
  whatsapp_ready_message: string;
  whatsapp_delivery_message: string;
  whatsapp_completed_message: string;
  whatsapp_connected: boolean;
  whatsapp_number: string | null;
  store_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  [key: string]: {
    open: string;
    close: string;
  };
}

export type OrderStatus = 
  | 'pending' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'completed' 
  | 'cancelled';

export interface CustomerData {
  name: string;
  phone: string;
  address: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  ready: 'Pronto para Retirada',
  out_for_delivery: 'Saiu para Entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'status-pending',
  preparing: 'status-preparing',
  ready: 'status-ready',
  out_for_delivery: 'status-delivery',
  completed: 'status-completed',
  cancelled: 'status-completed',
};
