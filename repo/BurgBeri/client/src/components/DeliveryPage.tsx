import { Truck, Clock, CreditCard, MapPin } from 'lucide-react';

export function DeliveryPage() {
  return (
    <div>
      <div className="mb-8 md:mb-12">
        <h2 className="text-white text-3xl md:text-4xl mb-3" data-testid="text-delivery-title">Оплата и доставка</h2>
        <p className="text-zinc-400">Информация о способах оплаты и условиях доставки</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800">
          <Truck className="w-10 h-10 md:w-12 md:h-12 text-orange-500 mb-4" />
          <h3 className="text-white text-xl md:text-2xl mb-4">Доставка</h3>
          <div className="space-y-3 text-zinc-400">
            <p>Бесплатная доставка от 1000 ₽</p>
            <p>Стоимость доставки: 150 ₽</p>
            <p>Время доставки: 30-60 минут</p>
            <p>Работаем с 10:00 до 23:00</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800">
          <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-orange-500 mb-4" />
          <h3 className="text-white text-xl md:text-2xl mb-4">Оплата</h3>
          <div className="space-y-3 text-zinc-400">
            <p>Наличными курьеру</p>
            <p>Картой курьеру</p>
            <p>Онлайн на сайте</p>
            <p>Безналичный расчет</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800">
          <Clock className="w-10 h-10 md:w-12 md:h-12 text-orange-500 mb-4" />
          <h3 className="text-white text-xl md:text-2xl mb-4">Режим работы</h3>
          <div className="space-y-3 text-zinc-400">
            <p>Понедельник - Воскресенье</p>
            <p className="text-orange-500 text-xl">10:00 - 23:00</p>
            <p className="text-sm">Прием заказов до 22:30</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800">
          <MapPin className="w-10 h-10 md:w-12 md:h-12 text-orange-500 mb-4" />
          <h3 className="text-white text-xl md:text-2xl mb-4">Наш адрес</h3>
          <div className="space-y-3 text-zinc-400">
            <p>г. Ейск</p>
            <p>ул. Плеханова, д. 15/4</p>
            <a href="tel:+79181772033" className="text-orange-500 hover:text-orange-400 transition-colors block">+7 918 177 20 33</a>
          </div>
        </div>
      </div>
    </div>
  );
}
