import { Tag, Gift, Percent } from 'lucide-react';

export function PromotionsPage() {
  const promotions = [
    {
      id: 1,
      title: 'Скидка 20% на первый заказ',
      description: 'При заказе от 1500 ₽ через мобильное приложение',
      discount: '20%',
      icon: Percent,
    },
    {
      id: 2,
      title: 'Бесплатная доставка',
      description: 'При заказе от 1000 ₽ доставка бесплатно',
      discount: '0 ₽',
      icon: Gift,
    },
    {
      id: 3,
      title: 'Комбо обед',
      description: 'Бургер + картофель + напиток всего за 450 ₽',
      discount: '-30%',
      icon: Tag,
    },
  ];

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-white text-4xl mb-3">Акции</h2>
        <p className="text-zinc-400">Специальные предложения и скидки</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {promotions.map((promo) => {
          const Icon = promo.icon;
          return (
            <div
              key={promo.id}
              className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 rounded-2xl p-8 border border-orange-600/30 hover:border-orange-500 transition-all"
            >
              <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="text-orange-500 text-4xl mb-4">{promo.discount}</div>
              <h3 className="text-white text-xl mb-3">{promo.title}</h3>
              <p className="text-zinc-400">{promo.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        <h3 className="text-white text-2xl mb-6">Условия акций</h3>
        <div className="space-y-3 text-zinc-400">
          <p>{'• Акции не суммируются с другими предложениями'}</p>
          <p>{'• Срок действия акций указан в описании'}</p>
          <p>{'• Подробности уточняйте у оператора'}</p>
          <p>{'• Организатор оставляет за собой право изменить условия акций'}</p>
        </div>
      </div>
    </div>
  );
}
