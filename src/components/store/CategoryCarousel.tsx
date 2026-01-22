import { InovaCategory } from '@/types/inovafood';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame, Coffee, Pizza, IceCream, Salad, Fish, UtensilsCrossed, Beef, Cake, Wine, Sandwich, Soup, ShoppingBag, Drumstick, Cookie, Apple, Beer, Croissant, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryCarouselProps {
  categories: InovaCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const categoryIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'todos': { icon: Utensils, color: 'text-primary', bg: 'bg-primary' },
  'lanches': { icon: Sandwich, color: 'text-amber-600', bg: 'bg-amber-100' },
  'bebidas': { icon: Coffee, color: 'text-sky-600', bg: 'bg-sky-100' },
  'pizzas': { icon: Pizza, color: 'text-orange-600', bg: 'bg-orange-100' },
  'sobremesas': { icon: Cake, color: 'text-pink-500', bg: 'bg-pink-100' },
  'acai': { icon: IceCream, color: 'text-purple-600', bg: 'bg-purple-100' },
  'japonesa': { icon: Fish, color: 'text-rose-600', bg: 'bg-rose-100' },
  'brasileira': { icon: Soup, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  'italiana': { icon: UtensilsCrossed, color: 'text-green-600', bg: 'bg-green-100' },
  'promocoes': { icon: Flame, color: 'text-red-600', bg: 'bg-red-100' },
  'carnes': { icon: Beef, color: 'text-red-700', bg: 'bg-red-100' },
  'churrasco': { icon: Beef, color: 'text-orange-700', bg: 'bg-orange-100' },
  'drinks': { icon: Wine, color: 'text-violet-600', bg: 'bg-violet-100' },
  'combos': { icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
  'marmitas': { icon: UtensilsCrossed, color: 'text-teal-600', bg: 'bg-teal-100' },
  'porcoes': { icon: Drumstick, color: 'text-amber-700', bg: 'bg-amber-100' },
  'salgados': { icon: Cookie, color: 'text-yellow-700', bg: 'bg-yellow-100' },
  'saudavel': { icon: Salad, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  'frutas': { icon: Apple, color: 'text-green-500', bg: 'bg-green-100' },
  'cervejas': { icon: Beer, color: 'text-amber-500', bg: 'bg-amber-100' },
  'padaria': { icon: Croissant, color: 'text-orange-500', bg: 'bg-orange-100' },
};

const defaultCategory = { icon: UtensilsCrossed, color: 'text-muted-foreground', bg: 'bg-muted' };

export function CategoryCarousel({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const allCategories = [
    { id: null, name: 'Todos', slug: 'todos' },
    ...categories
  ];

  const getCategoryStyle = (slug: string) => {
    return categoryIcons[slug.toLowerCase()] || defaultCategory;
  };

  return (
    <div className="relative group">
      {/* Scroll buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity bg-background shadow-lg rounded-full h-8 w-8 border-border"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity bg-background shadow-lg rounded-full h-8 w-8 border-border"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Categories */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-1"
      >
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const style = getCategoryStyle(category.slug);
          const IconComponent = style.icon;
          
          return (
            <button
              key={category.id || 'all'}
              onClick={() => onSelectCategory(category.id)}
              className="flex flex-col items-center gap-2 min-w-[70px] py-1 transition-all group/item"
            >
              {/* Icon circle - iFood style */}
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'bg-primary shadow-lg scale-105'
                    : cn(style.bg, 'group-hover/item:scale-105 group-hover/item:shadow-md')
                )}
              >
                <IconComponent 
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isSelected ? 'text-primary-foreground' : style.color
                  )} 
                  strokeWidth={2}
                />
              </div>
              
              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium text-center line-clamp-1 transition-colors',
                  isSelected ? 'text-primary font-semibold' : 'text-muted-foreground group-hover/item:text-foreground'
                )}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
