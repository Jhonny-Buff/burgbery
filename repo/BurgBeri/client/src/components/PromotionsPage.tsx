import { Tag, Gift, Percent } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Promotion {
  id: number;
  title: string;
  description: string | null;
  discountLabel: string | null;
  imageUrl?: string | null;
}

interface PromotionCard extends Promotion {
  icon?: typeof Tag;
}

export function PromotionsPage() {
  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ['/api/promotions'],
  });

  const defaultPromotions: PromotionCard[] = [
    {
      id: 1,
      title: 'Скидка 20% на первый заказ',
      description: 'При заказе от 1500 ₽ через мобильное приложение',
      discountLabel: '20%',
      imageUrl: null,
      icon: Percent,
    },
    {
      id: 2,
      title: 'Бесплатная доставка',
      description: 'При заказе от 1000 ₽ доставка бесплатно',
      discountLabel: '0 ₽',
      imageUrl: null,
      icon: Gift,
    },
    {
      id: 3,
      title: 'Комбо обед',
      description: 'Бургер + картофель + напиток всего за 450 ₽',
      discountLabel: '-30%',
      imageUrl: null,
      icon: Tag,
    },
  ];

  const baseIcons = [Percent, Gift, Tag];

  const items: PromotionCard[] = (promotions.length > 0
    ? promotions
    : defaultPromotions
  ).map((promo, index) => ({
    ...promo,
    icon: (promo as PromotionCard).icon || baseIcons[index % baseIcons.length],
  }));

  return (
    <div>
      <div className="mb-8 md:mb-12">
        <h2 className="text-white text-3xl md:text-4xl mb-3" data-testid="text-promo-title">Акции</h2>
        <p className="text-zinc-400">Специальные предложения и скидки</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((promo) => {
          const Icon = promo.icon ?? Tag;
          const discount = promo.discountLabel || 'Акция';

          return (
            <div
              key={promo.id}
              className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 rounded-2xl p-6 md:p-8 border border-orange-600/30 hover:border-orange-500 transition-all"
              data-testid={`card-promo-${promo.id}`}
            >
              {promo.imageUrl ? (
                <div className="mb-4 overflow-hidden rounded-xl border border-orange-600/30">
                  <img
                    src={promo.imageUrl}
                    alt={promo.title}
                    className="w-full h-40 object-cover"
                  />
                </div>
              ) : (
                <div className="bg-orange-600 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
              )}

              <div className="text-orange-500 text-3xl md:text-4xl mb-4">{discount}</div>
              <h3 className="text-white text-lg md:text-xl mb-3">{promo.title}</h3>
              {promo.description && (
                <p className="text-zinc-400">{promo.description}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800">
        <h3 className="text-white text-xl md:text-2xl mb-6">Условия акций</h3>
        <div className="space-y-3 text-zinc-400">
          <p>Акции не суммируются с другими предложениями</p>
          <p>Срок действия акций указан в описании</p>
          <p>Подробности уточняйте у оператора</p>
          <p>Организатор оставляет за собой право изменить условия акций</p>
        </div>
      </div>
    </div>
  );
}
