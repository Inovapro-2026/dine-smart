import { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { StoreHeader } from '@/components/store/StoreHeader';
import { CategoryTabs } from '@/components/store/CategoryTabs';
import { ProductCard } from '@/components/store/ProductCard';
import { CartDrawer } from '@/components/store/CartDrawer';
import { CheckoutModal } from '@/components/store/CheckoutModal';
import { Skeleton } from '@/components/ui/skeleton';

const DELIVERY_FEE = 5;

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-background pb-24">
      <StoreHeader 
        storeName="INOVAFOOD"
        address="Delivery • Lanches, Bebidas e mais"
        isOpen={true}
      />

      {categoriesLoading ? (
        <div className="container py-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        </div>
      ) : (
        <CategoryTabs
          categories={categories || []}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      <main className="container py-6">
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!productsLoading && filteredProducts?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
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
