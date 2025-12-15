import { ShoppingCart, Phone, MapPin, Menu } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useState } from 'react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  logoUrl?: string | null;
}

export function Header({ cartCount, onCartClick, currentPage, onNavigate, logoUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = ['Главная', 'Новинки', 'Меню', 'Оплата и доставка', 'Акции', 'Личный кабинет'];
  const defaultLogo =
    "https://images.unsplash.com/photo-1562296761-5d2add43d7d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjQ4OTY3MzB8MA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate('Главная')}>
            <ImageWithFallback
              src={logoUrl || defaultLogo}
              alt="Бургбери"
              className="w-10 h-10 lg:w-12 lg:h-12 object-cover rounded-full"
              data-testid="img-logo"
            />
          </div>
          
          <nav className="hidden lg:flex gap-6">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => onNavigate(item)}
                data-testid={`link-nav-${item}`}
                className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
                  currentPage === item
                    ? 'text-orange-500 border-orange-500'
                    : 'text-zinc-400 hover:text-white border-transparent'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
          
          <div className="hidden md:flex flex-col gap-1 text-sm ml-auto mr-4 lg:mr-8">
            <a href="tel:+79181772033" className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">+7 918 177 20 33</span>
            </a>
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap text-xs lg:text-sm">г. Ейск, ул. Плеханова, д. 15/4</span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2"
            data-testid="button-mobile-menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <button
            onClick={onCartClick}
            data-testid="button-cart"
            className="relative bg-orange-600 hover:bg-orange-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-full transition-all flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Корзина</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center" data-testid="text-cart-count">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-2 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  onNavigate(item);
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-2 rounded transition-colors ${
                  currentPage === item
                    ? 'text-orange-500 bg-zinc-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
            <div className="flex items-center gap-2 text-orange-500 py-2 px-2 md:hidden">
              <Phone className="w-4 h-4" />
              <a href="tel:+79181772033">+7 918 177 20 33</a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
