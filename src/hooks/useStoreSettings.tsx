import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WhatsAppMessages {
  welcome: string;
  preparing: string;
  ready: string;
  delivery: string;
  completed: string;
}

export interface StoreSettingsData {
  id?: string;
  delivery_fee: number;
  min_order_value: number;
  whatsapp_welcome_message: string;
  whatsapp_preparing_message: string;
  whatsapp_ready_message: string;
  whatsapp_delivery_message: string;
  whatsapp_completed_message: string;
  whatsapp_connected: boolean;
  whatsapp_number: string | null;
}

const DEFAULT_SETTINGS: StoreSettingsData = {
  delivery_fee: 5,
  min_order_value: 20,
  whatsapp_welcome_message: '👋 Bem-vindo ao INOVAFOOD!\nEscolha uma opção abaixo 👇\n\n1️⃣ Ver cardápio\n2️⃣ Falar com atendente\n3️⃣ Ver meu pedido\n4️⃣ Horário de funcionamento',
  whatsapp_preparing_message: '🍳 Seu pedido está sendo preparado!',
  whatsapp_ready_message: '✅ Seu pedido está pronto para retirada!',
  whatsapp_delivery_message: '🛵 Seu pedido saiu para entrega!',
  whatsapp_completed_message: '🎉 Pedido entregue! Obrigado pela preferência!',
  whatsapp_connected: false,
  whatsapp_number: null,
};

export function useStoreSettings(storeId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['store-settings', storeId],
    queryFn: async (): Promise<StoreSettingsData> => {
      let q = supabase.from('store_settings').select('*');
      
      if (storeId) {
        q = q.eq('store_id', storeId);
      }

      const { data, error } = await q.maybeSingle();

      if (error) {
        console.error('Error fetching store settings:', error);
        throw error;
      }

      if (!data) {
        return DEFAULT_SETTINGS;
      }

      return {
        id: data.id,
        delivery_fee: data.delivery_fee ?? DEFAULT_SETTINGS.delivery_fee,
        min_order_value: data.min_order_value ?? DEFAULT_SETTINGS.min_order_value,
        whatsapp_welcome_message: data.whatsapp_welcome_message ?? DEFAULT_SETTINGS.whatsapp_welcome_message,
        whatsapp_preparing_message: data.whatsapp_preparing_message ?? DEFAULT_SETTINGS.whatsapp_preparing_message,
        whatsapp_ready_message: data.whatsapp_ready_message ?? DEFAULT_SETTINGS.whatsapp_ready_message,
        whatsapp_delivery_message: data.whatsapp_delivery_message ?? DEFAULT_SETTINGS.whatsapp_delivery_message,
        whatsapp_completed_message: data.whatsapp_completed_message ?? DEFAULT_SETTINGS.whatsapp_completed_message,
        whatsapp_connected: data.whatsapp_connected ?? false,
        whatsapp_number: data.whatsapp_number ?? null,
      };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<StoreSettingsData>) => {
      // Check if settings exist
      let q = supabase.from('store_settings').select('id');
      if (storeId) q = q.eq('store_id', storeId);
      
      const { data: existing } = await q.maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('store_settings')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const insertData = {
          ...updates,
          store_id: storeId ?? null,
        };
        
        const { data, error } = await supabase
          .from('store_settings')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Configurações salvas!');
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    },
  });

  return {
    settings: query.data ?? DEFAULT_SETTINGS,
    isLoading: query.isLoading,
    updateSettings: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
  };
}

export function useWhatsAppMessages(storeId?: string) {
  const { settings, isLoading } = useStoreSettings(storeId);

  const messages: WhatsAppMessages = {
    welcome: settings.whatsapp_welcome_message,
    preparing: settings.whatsapp_preparing_message,
    ready: settings.whatsapp_ready_message,
    delivery: settings.whatsapp_delivery_message,
    completed: settings.whatsapp_completed_message,
  };

  return { messages, isLoading };
}
