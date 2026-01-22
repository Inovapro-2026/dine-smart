import { InovaCategory } from '@/types/inovafood';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryCarouselProps {
  categories: InovaCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const categoryIcons: Record<string, string> = {
  'lanches': '🍔',
  'bebidas': '🥤',
  'pizzas': '🍕',
  'sobremesas': '🍰',
  'acai': '🍇',
  'japonesa': '🍣',
  'brasileira': '🍛',
  'italiana': '🍝',
  'saudavel': '🥗',
  'promocoes': '🔥',
};

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
    { id: null, name: 'Todos', slug: 'todos', icon: '🍽️' },
    ...categories.map(cat => ({
      ...cat,
      icon: cat.icon || categoryIcons[cat.slug] || '🍴'
    }))
  ];

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
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-1"
      >
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id || 'all'}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                'flex flex-col items-center gap-2 min-w-[72px] py-2 transition-all',
                isSelected ? 'scale-105' : 'hover:scale-105'
              )}
            >
              {/* Icon circle */}
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-secondary hover:bg-secondary/80'
                )}
              >
                {category.icon}
              </div>
              
              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium text-center line-clamp-1',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
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
