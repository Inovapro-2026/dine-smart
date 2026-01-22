import { InovaCategory } from '@/types/inovafood';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame, Coffee, Pizza, IceCream, Salad, Fish, UtensilsCrossed, Beef, Cake, Wine, Sandwich, Soup } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryCarouselProps {
  categories: InovaCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const categoryIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'lanches': { icon: Sandwich, color: 'text-amber-600', bg: 'bg-amber-100' },
  'bebidas': { icon: Coffee, color: 'text-sky-600', bg: 'bg-sky-100' },
  'pizzas': { icon: Pizza, color: 'text-orange-600', bg: 'bg-orange-100' },
  'sobremesas': { icon: Cake, color: 'text-pink-600', bg: 'bg-pink-100' },
  'acai': { icon: IceCream, color: 'text-purple-600', bg: 'bg-purple-100' },
  'japonesa': { icon: Fish, color: 'text-rose-600', bg: 'bg-rose-100' },
  'brasileira': { icon: Soup, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  'italiana': { icon: UtensilsCrossed, color: 'text-green-600', bg: 'bg-green-100' },
  'saudavel': { icon: Salad, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  'promocoes': { icon: Flame, color: 'text-red-600', bg: 'bg-red-100' },
  'carnes': { icon: Beef, color: 'text-red-700', bg: 'bg-red-100' },
  'drinks': { icon: Wine, color: 'text-violet-600', bg: 'bg-violet-100' },
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
    return categoryIcons[slug] || defaultCategory;
  };

  return (
    <div className="relative group">
      {/* Scroll buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity bg-background shadow-lg rounded-full h-10 w-10"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity bg-background shadow-lg rounded-full h-10 w-10"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Categories */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-1"
      >
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const style = getCategoryStyle(category.slug);
          const IconComponent = style.icon;
          
          return (
            <button
              key={category.id || 'all'}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                'flex flex-col items-center gap-2 min-w-[80px] py-2 transition-all group/item',
                isSelected ? 'scale-105' : 'hover:scale-105'
              )}
            >
              {/* Icon circle */}
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm',
                  isSelected
                    ? 'bg-primary shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2'
                    : cn(style.bg, 'group-hover/item:shadow-md')
                )}
              >
                <IconComponent 
                  className={cn(
                    'h-7 w-7 transition-colors',
                    isSelected ? 'text-primary-foreground' : style.color
                  )} 
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
