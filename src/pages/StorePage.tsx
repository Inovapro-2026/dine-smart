import { useState, useMemo } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { StoreBanner } from '@/components/store/StoreBanner';
import { CategoryCarousel } from '@/components/store/CategoryCarousel';
import { ProductCard } from '@/components/store/ProductCard';
import { CartDrawer } from '@/components/store/CartDrawer';
import { CheckoutModal } from '@/components/store/CheckoutModal';
import { Skeleton } from '@/components/ui/skeleton';
import { InovaProduct } from '@/types/inovafood';

const DELIVERY_FEE = 5;

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const { data: products, isLoading: productsLoading } = useProducts(undefined, false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Filtrar produtos por categoria e busca
  const filteredProducts = useMemo(() => {
    let result = products || [];
    
    if (selectedCategory) {
      result = result.filter((p) => p.category_id === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [products, selectedCategory, searchQuery]);

  // Agrupar produtos por categoria
  const productsByCategory = useMemo(() => {
    if (selectedCategory || searchQuery.trim()) {
      return null; // Não agrupa quando há filtro
    }
    
    const grouped: Record<string, InovaProduct[]> = {};
    
    products?.forEach((product) => {
      const categoryId = product.category_id || 'outros';
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(product);
    });
    
    return grouped;
  }, [products, selectedCategory, searchQuery]);

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || 'Outros';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header com busca */}
      <StoreBanner 
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Categorias */}
      <section className="bg-card border-b sticky top-0 z-20">
        <div className="container py-4">
          {categoriesLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <CategoryCarousel
              categories={categories || []}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}
        </div>
      </section>

      {/* Produtos */}
      <main className="container py-6">
        {productsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 flex gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="w-28 h-28 rounded-xl" />
              </div>
            ))}
          </div>
        ) : productsByCategory ? (
          // Produtos agrupados por categoria
          <div className="space-y-8">
            {Object.entries(productsByCategory).map(([categoryId, categoryProducts]) => (
              <section key={categoryId}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {getCategoryName(categoryId)}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({categoryProducts.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          // Produtos filtrados
          <div className="space-y-4">
            {searchQuery && (
              <p className="text-muted-foreground">
                {filteredProducts.length} resultado(s) para "{searchQuery}"
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {!productsLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground">
              Tente buscar por outro termo ou explore as categorias
            </p>
          </div>
        )}
      </main>

      <CartDrawer 
        onCheckout={() => setIsCheckoutOpen(true)} 
        deliveryFee={DELIVERY_FEE}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        deliveryFee={DELIVERY_FEE}
      />
    </div>
  );
}
