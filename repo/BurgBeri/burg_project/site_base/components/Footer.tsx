import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Логотип и описание */}
          <div>
            <div className="mb-4">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1562296761-5d2add43d7d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjQ4OTY3MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Бургбери"
                className="w-16 h-16 object-cover rounded-full"
              />
            </div>
            <h3 className="text-white mb-2">Бургбери</h3>
            <p className="text-zinc-400 text-sm">
              Вкусная еда с доставкой по городу Ейск
            </p>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="text-white mb-4">Наши контакты</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-zinc-400 text-sm">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-orange-500" />
                <span>г. Ейск, ул. Плеханова, д. 15/4</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0 text-orange-500" />
                <div className="flex flex-col">
                  <span>+7 (900) 28-777-40</span>
                  <span>+7 (918) 17-720-33</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0 text-orange-500" />
                <a href="mailto:burgberi@mail.ru" className="hover:text-orange-500 transition-colors">
                  burgberi@mail.ru
                </a>
              </div>
            </div>
          </div>

          {/* О компании и сотрудничество */}
          <div>
            <h4 className="text-white mb-4">О компании</h4>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">О нас</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">Сотрудничество</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">Политика конфиденциальности</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">Условия использования</a>
              </li>
            </ul>
          </div>

          {/* Работа с нами */}
          <div>
            <h4 className="text-white mb-4">Работа с нами</h4>
            <div className="space-y-3 mb-6">
              <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <p className="text-white text-sm mb-1">Повар</p>
                <p className="text-zinc-500 text-xs">от 45 000 ₽</p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <p className="text-white text-sm mb-1">Курьер</p>
                <p className="text-zinc-500 text-xs">от 35 000 ₽</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-white text-sm mb-3">Мы в соцсетях</h4>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="bg-zinc-900 hover:bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-zinc-800"
                  aria-label="ВКонтакте"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.15 14.83h-1.4c-.46 0-.6-.37-1.42-1.19-.72-.69-1.04-.78-1.22-.78-.25 0-.32.07-.32.41v1.08c0 .29-.09.46-.86.46-1.31 0-2.76-.79-3.78-2.25-1.53-2.12-1.95-3.71-1.95-4.04 0-.18.07-.35.41-.35h1.4c.31 0 .42.14.54.47.61 1.72 1.63 3.23 2.05 3.23.16 0 .23-.07.23-.48v-1.87c-.05-.83-.49-1.01-.49-1.34 0-.15.12-.3.32-.3h2.21c.26 0 .35.14.35.44v2.53c0 .26.12.35.19.35.16 0 .29-.09.58-.38 1.08-1.22 1.85-3.1 1.85-3.1.1-.21.24-.35.56-.35h1.4c.34 0 .41.17.34.44-.26.83-1.97 3.32-1.97 3.32-.13.21-.18.3 0 .53.13.18.55.53.83.86.51.58.91 1.07 1.01 1.41.11.34-.06.51-.39.51z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-zinc-900 hover:bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-zinc-800"
                  aria-label="Telegram"
                >
                  <Send className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8">
          <p className="text-zinc-500 text-sm text-center">
            © 2024 Бургбери. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
