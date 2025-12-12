import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  return (
    <div className="relative h-[500px] overflow-hidden rounded-3xl mb-12">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1651993841930-946a700c1524?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBwaXp6YSUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc2NDg5NjczMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        alt="Бургбери баннер"
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent">
        <div className="h-full flex flex-col justify-center px-12 max-w-2xl">
          <h2 className="text-white text-5xl mb-4">Вкус, который вы полюбите</h2>
          <p className="text-zinc-300 text-xl mb-8">
            Бургбери — это качественная еда, приготовленная с любовью. 
            Доставка по городу за 30 минут!
          </p>
          <div className="flex gap-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full transition-all text-lg">
              Смотреть меню
            </button>
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full transition-all text-lg border border-white/20">
              Акции
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}