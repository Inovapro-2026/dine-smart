import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Truck, Percent, Users, Clock, Gift, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromoSlide {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
  iconBg: string;
  badge?: string;
}

const promoSlides: PromoSlide[] = [
  {
    id: '1',
    title: 'Frete Grátis',
    subtitle: 'Em pedidos acima de R$ 50',
    bgColor: 'bg-gradient-to-r from-primary via-primary to-primary/90',
    textColor: 'text-primary-foreground',
    icon: Truck,
    iconBg: 'bg-white/20',
    badge: 'HOJE',
  },
  {
    id: '2',
    title: '20% OFF',
    subtitle: 'Em todos os lanches',
    bgColor: 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600',
    textColor: 'text-white',
    icon: Percent,
    iconBg: 'bg-white/20',
    badge: 'ESPECIAL',
  },
  {
    id: '3',
    title: 'Combo Família',
    subtitle: 'A partir de R$ 49,90',
    bgColor: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-teal-600',
    textColor: 'text-white',
    icon: Users,
    iconBg: 'bg-white/20',
    badge: 'NOVO',
  },
  {
    id: '4',
    title: 'Happy Hour',
    subtitle: 'Bebidas com 30% OFF até 18h',
    bgColor: 'bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600',
    textColor: 'text-white',
    icon: Clock,
    iconBg: 'bg-white/20',
    badge: 'DIÁRIO',
  },
  {
    id: '5',
    title: 'Primeira Compra',
    subtitle: 'Ganhe R$15 de desconto',
    bgColor: 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500',
    textColor: 'text-white',
    icon: Gift,
    iconBg: 'bg-white/20',
    badge: 'NOVOS',
  },
  {
    id: '6',
    title: 'Super Promoção',
    subtitle: 'Itens selecionados pela metade do preço',
    bgColor: 'bg-gradient-to-r from-red-500 via-red-600 to-orange-500',
    textColor: 'text-white',
    icon: Flame,
    iconBg: 'bg-white/20',
    badge: 'IMPERDÍVEL',
  },
];

export function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div 
      className="relative overflow-hidden rounded-2xl mx-4 mt-4"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {promoSlides.map((slide) => {
          const IconComponent = slide.icon;
          return (
            <div
              key={slide.id}
              className={cn(
                'min-w-full h-32 sm:h-40 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity',
                slide.bgColor
              )}
            >
              <div className={cn('space-y-1 flex-1', slide.textColor)}>
                {slide.badge && (
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 tracking-wide">
                    {slide.badge}
                  </span>
                )}
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{slide.title}</h3>
                <p className="text-sm sm:text-base opacity-90">{slide.subtitle}</p>
              </div>
              
              {/* Icon illustration */}
              <div className={cn(
                'hidden sm:flex items-center justify-center w-24 h-24 rounded-full',
                slide.iconBg
              )}>
                <IconComponent className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {promoSlides.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === currentSlide 
                ? 'w-6 bg-white' 
                : 'w-1.5 bg-white/50 hover:bg-white/70'
            )}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
