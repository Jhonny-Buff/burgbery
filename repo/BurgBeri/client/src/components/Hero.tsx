import { ImageWithFallback } from './ImageWithFallback';

interface HeroProps {
  onNavigate: (page: string) => void;
  heroImageUrl?: string | null;
}

export function Hero({ onNavigate, heroImageUrl }: HeroProps) {
  const fallbackHero =
    'https://images.unsplash.com/photo-1651993841930-946a700c1524?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBwaXp6YSUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc2NDg5NjczMHww&ixlib=rb-4.1.0&q=80&w=1080';
  const heroSrc = heroImageUrl && heroImageUrl.trim().length > 0 ? heroImageUrl : fallbackHero;

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl md:rounded-3xl mb-8 md:mb-12">
      <ImageWithFallback
        src={heroSrc}
        alt="Бургбери баннер"
        className="w-full h-full object-cover"
        data-testid="img-hero"
      />
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent">
        <div className="h-full flex flex-col justify-center px-6 md:px-12 max-w-2xl">
          <h2 className="text-white text-3xl md:text-5xl mb-4" data-testid="text-hero-title">Вкус, который вы полюбите</h2>
          <p className="text-zinc-300 text-base md:text-xl mb-6 md:mb-8" data-testid="text-hero-description">
            Бургбери — это качественная еда, приготовленная с любовью. 
            Доставка по городу за 30 минут!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={() => onNavigate('Меню')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-full transition-all text-base md:text-lg"
              data-testid="button-hero-menu"
            >
              Смотреть меню
            </button>
            <button 
              onClick={() => onNavigate('Акции')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 md:px-8 py-3 md:py-4 rounded-full transition-all text-base md:text-lg border border-white/20"
              data-testid="button-hero-promo"
            >
              Акции
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
