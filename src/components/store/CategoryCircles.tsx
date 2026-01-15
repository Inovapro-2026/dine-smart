import { InovaCategory } from '@/types/inovafood';
import { cn } from '@/lib/utils';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryCirclesProps {
  categories: InovaCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryCircles({ categories, selectedCategory, onSelectCategory }: CategoryCirclesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const allCategories = [
    { id: null, name: 'Tudo', icon: '🍽️', slug: 'all' },
    ...categories.map(c => ({ ...c, id: c.id })),
  ];

  return (
    <div className="relative py-4 sm:py-6">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-lg bg-background/90 backdrop-blur-sm hidden sm:flex"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-lg bg-background/90 backdrop-blur-sm hidden sm:flex"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Categories scroll */}
      <div 
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {allCategories.map((category, index) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id ?? 'all'}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                'flex flex-col items-center gap-2 min-w-[70px] sm:min-w-[80px] transition-all duration-300 group',
                'animate-fade-in',
              )}
              style={{ 
                animationDelay: `${index * 50}ms`,
                scrollSnapAlign: 'center'
              }}
            >
              {/* Circle with icon */}
              <div 
                className={cn(
                  'w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl',
                  'transition-all duration-300 shadow-md',
                  'group-hover:scale-110 group-hover:shadow-xl',
                  isSelected 
                    ? 'bg-primary text-white shadow-primary/40 ring-4 ring-primary/30 scale-110'
                    : 'bg-secondary hover:bg-secondary/80'
                )}
              >
                <span className={cn(
                  'transition-transform duration-300',
                  isSelected && 'animate-bounce'
                )}>
                  {category.icon}
                </span>
              </div>
              
              {/* Name */}
              <span className={cn(
                'text-xs sm:text-sm font-medium text-center line-clamp-1 transition-colors',
                isSelected ? 'text-primary font-semibold' : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {category.name}
              </span>

              {/* Active indicator */}
              <div className={cn(
                'h-1 rounded-full transition-all duration-300',
                isSelected ? 'w-6 bg-primary' : 'w-0 bg-transparent'
              )} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
