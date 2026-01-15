import { InovaProduct } from '@/types/inovafood';
import { useCart } from '@/hooks/useCart';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ProductCardProps {
  product: InovaProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  const itemInCart = items.find((item) => item.product.id === product.id);
  const quantity = itemInCart?.quantity || 0;

  const handleAddItem = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="product-card animate-fade-in">
      {/* Imagem do produto */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        
        {/* Badge de quantidade no carrinho */}
        {quantity > 0 && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full animate-bounce-in">
            {quantity}x
          </div>
        )}
      </div>

      {/* Informações do produto */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[40px]">
          {product.description || 'Produto delicioso'}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>

          <Button
            size="sm"
            className={`rounded-full transition-all duration-300 ${
              isAdded ? 'bg-success hover:bg-success' : ''
            }`}
            onClick={handleAddItem}
          >
            {isAdded ? (
              <Check className="h-4 w-4" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
