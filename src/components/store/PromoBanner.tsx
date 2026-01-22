import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Truck, Percent, Users, Clock, Gift, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBanners, PromoBanner as PromoBannerType } from '@/hooks/useBanners';
import { Skeleton } from '@/components/ui/skeleton';

interface DefaultSlide {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
  iconBg: string;
  badge?: string;
}

const defaultSlides: DefaultSlide[] = [
  {
    id: 'default-1',
    title: 'Frete Grátis',
    subtitle: 'Em pedidos acima de R$ 50',
    bgColor: 'bg-gradient-to-r from-primary via-primary to-primary/90',
    textColor: 'text-primary-foreground',
    icon: Truck,
    iconBg: 'bg-white/20',
    badge: 'HOJE',
  },
  {
    id: 'default-2',
    title: '20% OFF',
    subtitle: 'Em todos os lanches',
    bgColor: 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600',
    textColor: 'text-white',
    icon: Percent,
    iconBg: 'bg-white/20',
    badge: 'ESPECIAL',
  },
  {
    id: 'default-3',
    title: 'Combo Família',
    subtitle: 'A partir de R$ 49,90',
    bgColor: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-teal-600',
    textColor: 'text-white',
    icon: Users,
    iconBg: 'bg-white/20',
    badge: 'NOVO',
  },
];

export function PromoBanner() {
  const { data: dbBanners, isLoading } = useBanners();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Use database banners if available, otherwise use defaults
  const hasDbBanners = dbBanners && dbBanners.length > 0;
  const totalSlides = hasDbBanners ? dbBanners.length : defaultSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;
    
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, totalSlides]);

  // Reset slide when banners change
  useEffect(() => {
    setCurrentSlide(0);
  }, [hasDbBanners]);

  if (isLoading) {
    return (
      <div className="mx-4 mt-4">
        <Skeleton className="h-32 sm:h-40 rounded-2xl" />
      </div>
    );
  }

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
        {hasDbBanners ? (
          // Database banners with images
          dbBanners.map((banner: PromoBannerType) => (
            <div
              key={banner.id}
              className="min-w-full h-32 sm:h-40 rounded-2xl overflow-hidden relative cursor-pointer"
              onClick={() => banner.link && (window.location.href = banner.link)}
            >
              {/* Background image */}
              <img 
                src={banner.image_url} 
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              
              {/* Content */}
              <div className="relative h-full p-6 flex flex-col justify-center text-white">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-lg">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-sm sm:text-base opacity-90 mt-1 drop-shadow-md">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          // Default slides with icons
          defaultSlides.map((slide) => {
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
                
                <div className={cn(
                  'hidden sm:flex items-center justify-center w-24 h-24 rounded-full',
                  slide.iconBg
                )}>
                  <IconComponent className="w-12 h-12 text-white" strokeWidth={1.5} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Buttons - only show if more than 1 slide */}
      {totalSlides > 1 && (
        <>
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
            {Array.from({ length: totalSlides }).map((_, index) => (
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
        </>
      )}
    </div>
  );
}
