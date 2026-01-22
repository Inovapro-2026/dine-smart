import { MapPin, Search } from 'lucide-react';
import { SearchBar } from './SearchBar';

interface StoreBannerProps {
  storeName?: string;
  address?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function StoreBanner({ 
  storeName = 'INOVAFOOD',
  address = 'Sua localização',
  searchValue,
  onSearchChange
}: StoreBannerProps) {
  return (
    <header className="bg-primary text-primary-foreground">
      {/* Top bar */}
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-xl font-bold">🍔</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold">{storeName}</h1>
              <div className="flex items-center gap-1 text-xs opacity-90">
                <MapPin className="h-3 w-3" />
                <span>{address}</span>
              </div>
            </div>
          </div>

          {/* Search - Desktop */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar no cardápio..."
                className="w-full pl-12 pr-4 h-11 rounded-xl bg-primary-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 bg-primary-foreground/20 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">Aberto</span>
          </div>
        </div>

        {/* Search - Mobile */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="w-full pl-12 pr-4 h-11 rounded-xl bg-primary-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
