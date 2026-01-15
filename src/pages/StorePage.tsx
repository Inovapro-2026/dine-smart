import { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { RestaurantHeader } from '@/components/store/RestaurantHeader';
import { CategoryCircles } from '@/components/store/CategoryCircles';
import { RestaurantProductCard } from '@/components/store/RestaurantProductCard';
import { CartDrawer } from '@/components/store/CartDrawer';
import { CheckoutModal } from '@/components/store/CheckoutModal';
import { AIChatWidget } from '@/components/store/AIChatWidget';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DELIVERY_FEE = 5;

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading: productsLoading } = useProducts(undefined, false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const filteredProducts = products?.filter((p) => {
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background pb-28">
      {/* Restaurant Header */}
      <RestaurantHeader
        storeName="INOVAFOOD"
        address="Gastronomia Premium • Delivery Express"
        isOpen={true}
        rating={4.8}
        deliveryTime="30-45 min"
      />

      {/* Search bar */}
      <div className="container px-4 mt-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no cardápio..."
            className="pl-11 rounded-full bg-card border-border/50 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category circles */}
      {categoriesLoading ? (
        <div className="container py-6">
          <div className="flex gap-6 overflow-hidden px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="container">
          <CategoryCircles
            categories={categories || []}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      )}

      {/* Section title */}
      <div className="container px-4 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          {selectedCategory 
            ? `${categories?.find(c => c.id === selectedCategory)?.icon || ''} ${categories?.find(c => c.id === selectedCategory)?.name || 'Categoria'}`
            : '🔥 Destaques do Cardápio'
          }
        </h2>
        <p className="text-sm text-muted-foreground">
          {filteredProducts?.length || 0} itens disponíveis
        </p>
      </div>

      {/* Products grid */}
      <main className="container px-4">
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-card">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts?.map((product, index) => (
              <div 
                key={product.id} 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <RestaurantProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {!productsLoading && filteredProducts?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Tente buscar com outros termos' : 'Selecione outra categoria'}
            </p>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        onCheckout={() => setIsCheckoutOpen(true)}
        deliveryFee={DELIVERY_FEE}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        deliveryFee={DELIVERY_FEE}
      />

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
