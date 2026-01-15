import { MapPin, Clock, Star, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RestaurantHeaderProps {
  storeName?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address?: string;
  isOpen?: boolean;
  rating?: number;
  deliveryTime?: string;
}

export function RestaurantHeader({
  storeName = 'INOVAFOOD',
  logoUrl,
  bannerUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
  address = 'Restaurante Premium',
  isOpen = true,
  rating = 4.8,
  deliveryTime = '30-45 min',
}: RestaurantHeaderProps) {
  return (
    <header className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/30 animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Banner with parallax-like effect */}
      <div className="relative h-40 sm:h-52 md:h-64 overflow-hidden">
        <img
          src={bannerUrl}
          alt="Banner"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-background" />

        {/* Floating elements */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-lg animate-fade-in">
            <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
            {rating}
          </Badge>
          <Badge 
            variant={isOpen ? 'default' : 'destructive'}
            className={`shadow-lg animate-fade-in ${isOpen ? 'bg-success' : ''}`}
            style={{ animationDelay: '100ms' }}
          >
            {isOpen ? 'Aberto' : 'Fechado'}
          </Badge>
        </div>
      </div>

      {/* Restaurant info card */}
      <div className="container relative -mt-16 sm:-mt-20 z-10 px-4">
        <div className="bg-card rounded-2xl shadow-xl border p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 animate-slide-up">
          {/* Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl flex items-center justify-center shrink-0 ring-4 ring-background">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <ChefHat className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              {storeName}
            </h1>

            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{address}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{deliveryTime}</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="hidden md:flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">150+</p>
              <p className="text-xs text-muted-foreground">Itens</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">4.8</p>
              <p className="text-xs text-muted-foreground">Avaliação</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">🔥</p>
              <p className="text-xs text-muted-foreground">Popular</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
