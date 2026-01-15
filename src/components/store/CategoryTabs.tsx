import { InovaCategory } from '@/types/inovafood';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: InovaCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryTabs({ categories, selectedCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
      <div className="container py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Botão "Todos" */}
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium',
              selectedCategory === null
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            🍽️ Todos
          </button>

          {/* Categorias */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
