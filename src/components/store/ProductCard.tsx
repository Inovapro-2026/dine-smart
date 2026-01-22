import { InovaProduct } from '@/types/inovafood';
import { useCart } from '@/hooks/useCart';
import { Plus, Minus, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ProductCardProps {
  product: InovaProduct;
}

// Simula produtos em oferta (em produção viria do banco)
const PRODUCTS_ON_SALE: Record<string, number> = {
  // IDs de produtos com desconto (percentual)
};

// Função para determinar se produto tem desconto baseado no nome/categoria
function getProductDiscount(product: InovaProduct): number | null {
  const name = product.name.toLowerCase();
  const categorySlug = product.category?.slug?.toLowerCase() || '';
  
  // Produtos com "combo" ou "promocao" no nome
  if (name.includes('combo') || name.includes('promoção') || name.includes('oferta')) {
    return 15;
  }
  
  // Lanches tem 10% off
  if (categorySlug === 'lanches' || name.includes('hamburguer') || name.includes('burger')) {
    return 10;
  }
  
  // Bebidas grandes
  if (name.includes('2l') || name.includes('família')) {
    return 20;
  }
  
  // Sobremesas
  if (categorySlug === 'sobremesas' || name.includes('sorvete') || name.includes('açaí')) {
    return 5;
  }
  
  // Verificar ID específico
  if (PRODUCTS_ON_SALE[product.id]) {
    return PRODUCTS_ON_SALE[product.id];
  }
  
  return null;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, removeItem, items } = useCart();
  
  const itemInCart = items.find((item) => item.product.id === product.id);
  const quantity = itemInCart?.quantity || 0;
  
  const discount = useMemo(() => getProductDiscount(product), [product]);
  const originalPrice = product.price;
  const finalPrice = discount ? originalPrice * (1 - discount / 100) : originalPrice;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in relative">
      {/* Badge de desconto */}
      {discount && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          <Percent className="h-3 w-3" />
          {discount}% OFF
        </div>
      )}
      
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
            <div className="flex flex-col">
              {discount ? (
                <>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(finalPrice)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-primary">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {quantity === 0 ? (
              <Button
                size="sm"
                className={cn(
                  "rounded-full h-9 px-4 shadow-lg",
                  discount 
                    ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" 
                    : "bg-primary hover:bg-primary/90 shadow-primary/20"
                )}
                onClick={() => addItem(product)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            ) : (
              <div className={cn(
                "flex items-center gap-2 rounded-full px-1 py-1",
                discount ? "bg-green-600" : "bg-primary"
              )}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full text-white hover:bg-white/20"
                  onClick={() => removeItem(product.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-white font-bold min-w-[20px] text-center">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full text-white hover:bg-white/20"
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
            <div className={cn(
              "absolute -top-2 -right-2 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg",
              discount ? "bg-green-600" : "bg-primary"
            )}>
              {quantity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
