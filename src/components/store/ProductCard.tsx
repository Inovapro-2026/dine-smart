import { InovaProduct } from '@/types/inovafood';
import { useCart } from '@/hooks/useCart';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: InovaProduct;
}

export function ProductCard({ product }: ProductCardProps) {
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
    <div className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in">
      <div className="flex h-full">
        {/* Informações do produto */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description || 'Produto delicioso preparado com ingredientes selecionados'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>

            {quantity === 0 ? (
              <Button
                size="sm"
                className="rounded-full h-9 px-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                onClick={() => addItem(product)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-primary rounded-full px-1 py-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => removeItem(product.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-primary-foreground font-bold min-w-[20px] text-center">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => addItem(product)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Imagem do produto */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 m-3">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badge de quantidade */}
          {quantity > 0 && (
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
              {quantity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
