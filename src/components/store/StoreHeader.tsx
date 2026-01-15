import { MapPin, Clock, Phone } from 'lucide-react';

interface StoreHeaderProps {
  storeName?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address?: string;
  phone?: string;
  isOpen?: boolean;
}

export function StoreHeader({ 
  storeName = 'INOVAFOOD',
  logoUrl,
  bannerUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop',
  address = 'Rua Principal, 123 - Centro',
  phone,
  isOpen = true
}: StoreHeaderProps) {
  return (
    <header className="relative">
      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={bannerUrl}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Informações da loja */}
      <div className="container relative -mt-20 z-10 pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-card shadow-xl border-4 border-background overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full hero-gradient flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-white">
                  {storeName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="flex-1 text-white md:text-foreground md:bg-card md:p-4 md:rounded-xl md:shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg md:drop-shadow-none md:text-foreground">
              {storeName}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span className="opacity-90 md:text-muted-foreground">{address}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className={`font-medium ${isOpen ? 'text-success' : 'text-destructive'}`}>
                  {isOpen ? 'Aberto agora' : 'Fechado'}
                </span>
              </div>

              {phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  <span className="opacity-90 md:text-muted-foreground">{phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
