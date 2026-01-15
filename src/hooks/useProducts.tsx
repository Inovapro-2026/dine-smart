import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InovaProduct, InovaCategory } from '@/types/inovafood';

export function useProducts(storeId?: string) {
  return useQuery({
    queryKey: ['inovafood-products', storeId],
    queryFn: async (): Promise<InovaProduct[]> => {
      let query = supabase
        .from('inovafood_products')
        .select(`
          *,
          category:inovafood_categories(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        category: item.category as InovaCategory | undefined
      })) as InovaProduct[];
    },
  });
}

export function useCategories(storeId?: string) {
  return useQuery({
    queryKey: ['inovafood-categories', storeId],
    queryFn: async (): Promise<InovaCategory[]> => {
      let query = supabase
        .from('inovafood_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data as InovaCategory[];
    },
  });
}

export function useProductsByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: ['inovafood-products-by-category', categoryId],
    queryFn: async (): Promise<InovaProduct[]> => {
      let query = supabase
        .from('inovafood_products')
        .select(`
          *,
          category:inovafood_categories(*)
        `)
        .eq('is_active', true);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        category: item.category as InovaCategory | undefined
      })) as InovaProduct[];
    },
    enabled: categoryId !== undefined,
  });
}
