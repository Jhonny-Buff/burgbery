import { ShoppingCart, Phone, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ cartCount, onCartClick, currentPage, onNavigate }: HeaderProps) {
  const navItems = ['Главная', 'Новинки', 'Меню', 'Оплата и доставка', 'Акции'];
  
  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1562296761-5d2add43d7d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjQ4OTY3MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Бургбери"
              className="w-12 h-12 object-cover rounded-full"
            />
          </div>
          
          <nav className="flex gap-6">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => onNavigate(item)}
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
          
          <div className="flex flex-col gap-1 text-sm ml-auto mr-8">
            <div className="flex items-center gap-2 text-orange-500">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">+7 918 177 20 33</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">г. Ейск, ул. Плеханово, д. 15/4</span>
            </div>
          </div>
          
          <button
            onClick={onCartClick}
            className="relative bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full transition-all flex items-center gap-2 flex-shrink-0"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Корзина</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}