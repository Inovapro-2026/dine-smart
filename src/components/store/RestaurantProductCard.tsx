import { InovaProduct } from '@/types/inovafood';
import { useCart } from '@/hooks/useCart';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RestaurantProductCardProps {
  product: InovaProduct;
}

export function RestaurantProductCard({ product }: RestaurantProductCardProps) {
  const { addItem, removeItem, items } = useCart();

  const itemInCart = items.find((item) => item.product.id === product.id);
  const quantity = itemInCart?.quantity || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className={cn(
      'group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300',
      'border border-border/50 hover:border-primary/20',
      'animate-fade-in'
    )}>
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category badge */}
        {product.category && (
          <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
            {product.category.icon} {product.category.name}
          </div>
        )}

        {/* Cart quantity */}
        {quantity > 0 && (
          <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
            {quantity}
          </div>
        )}

        {/* Quick add button on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={() => addItem(product)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
          {product.description || 'Deliciosa opção do nosso cardápio'}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>

          {/* Quantity controls */}
          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-secondary rounded-full p-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeItem(product.id)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-bold text-sm min-w-[20px] text-center">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                onClick={() => addItem(product)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full gap-2 hover:bg-primary hover:text-white hover:border-primary"
              onClick={() => addItem(product)}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
