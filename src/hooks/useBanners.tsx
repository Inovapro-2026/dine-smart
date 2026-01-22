import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PromoBanner {
  id: string;
  store_id: string | null;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useBanners(storeId?: string) {
  return useQuery({
    queryKey: ['promo-banners', storeId],
    queryFn: async (): Promise<PromoBanner[]> => {
      let q = supabase
        .from('promo_banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (storeId) {
        q = q.eq('store_id', storeId);
      }

      const { data, error } = await q;

      if (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }

      return data || [];
    },
  });
}

export function useAdminBanners(storeId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-promo-banners', storeId],
    queryFn: async (): Promise<PromoBanner[]> => {
      let q = supabase
        .from('promo_banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (storeId) {
        q = q.eq('store_id', storeId);
      }

      const { data, error } = await q;

      if (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }

      return data || [];
    },
  });

  const uploadBanner = useMutation({
    mutationFn: async ({ 
      file, 
      title, 
      subtitle,
      link 
    }: { 
      file: File; 
      title: string; 
      subtitle?: string;
      link?: string;
    }) => {
      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      // Get max sort_order
      const { data: maxOrder } = await supabase
        .from('promo_banners')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

      const newSortOrder = (maxOrder?.sort_order ?? -1) + 1;

      // Insert banner record
      const { data, error } = await supabase
        .from('promo_banners')
        .insert({
          title,
          subtitle: subtitle || null,
          image_url: urlData.publicUrl,
          link: link || null,
          store_id: storeId || null,
          sort_order: newSortOrder,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-banners'] });
      queryClient.invalidateQueries({ queryKey: ['promo-banners'] });
      toast.success('Banner adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Error uploading banner:', error);
      toast.error('Erro ao fazer upload do banner');
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Omit<PromoBanner, 'id' | 'created_at' | 'updated_at'>>;
    }) => {
      const { data, error } = await supabase
        .from('promo_banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-banners'] });
      queryClient.invalidateQueries({ queryKey: ['promo-banners'] });
      toast.success('Banner atualizado!');
    },
    onError: (error) => {
      console.error('Error updating banner:', error);
      toast.error('Erro ao atualizar banner');
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      // Get banner to delete image
      const { data: banner } = await supabase
        .from('promo_banners')
        .select('image_url')
        .eq('id', id)
        .single();

      // Delete from database
      const { error } = await supabase
        .from('promo_banners')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Try to delete image from storage
      if (banner?.image_url) {
        const path = banner.image_url.split('/banners/').pop();
        if (path) {
          await supabase.storage.from('banners').remove([`banners/${path}`]);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-banners'] });
      queryClient.invalidateQueries({ queryKey: ['promo-banners'] });
      toast.success('Banner removido!');
    },
    onError: (error) => {
      console.error('Error deleting banner:', error);
      toast.error('Erro ao remover banner');
    },
  });

  return {
    banners: query.data || [],
    isLoading: query.isLoading,
    uploadBanner: uploadBanner.mutateAsync,
    isUploading: uploadBanner.isPending,
    updateBanner: updateBanner.mutateAsync,
    deleteBanner: deleteBanner.mutateAsync,
    isDeleting: deleteBanner.isPending,
  };
}
