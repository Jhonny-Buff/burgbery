import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard, Product } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { Cart, CartItem } from './components/Cart';
import { MenuPage } from './components/MenuPage';
import { DeliveryPage } from './components/DeliveryPage';
import { PromotionsPage } from './components/PromotionsPage';
import { NewItemsPage } from './components/NewItemsPage';
import { Map } from './components/Map';
import { Footer } from './components/Footer';

const products: Product[] = [
  {
    id: 1,
    name: 'Классический бургер',
    description: 'Сочная говяжья котлета, свежие овощи, сыр и фирменный соус',
    price: 350,
    image: 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc2NDgwMzQzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Бургеры',
    weight: '350г',
    fullDescription: 'Классический бургер с сочной говяжьей котлетой, приготовленной на гриле. Свежие овощи добавляют хрустящей текстуры, а наш фирменный соус придает неповторимый вкус.',
    ingredients: 'Булочка для бургера, говяжья котлета, салат айсберг, помидор, маринованный огурец, сыр чеддер, фирменный соус, лук',
  },
  {
    id: 2,
    name: 'Двойной бургер',
    description: 'Две котлеты, двойной сыр, бекон и овощи',
    price: 490,
    image: 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc2NDgwMzQzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Бургеры',
    weight: '450г',
    fullDescription: 'Для тех, кто по-настоящему голоден! Две сочные котлеты, два слоя сыра, хрустящий бекон и свежие овощи в одном большом бургере.',
    ingredients: 'Булочка для бургера, 2 говяжьих котлеты, салат, помидор, огурец, 2 ломтика сыра чеддер, бекон, соус BBQ, лук',
  },
  {
    id: 3,
    name: 'Филадельфия',
    description: 'Лосось, сливочный сыр, огурец, нори и рис',
    price: 420,
    image: 'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJvbGxzfGVufDF8fHx8MTc2NDg3NjI4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Роллы',
    weight: '280г',
    fullDescription: 'Классический ролл с нежным лососем и сливочным сыром. Идеальное сочетание вкусов для истинных ценителей японской кухни.',
    ingredients: 'Лосось свежий, сыр сливочный Филадельфия, огурец свежий, рис для суши, нори',
  },
  {
    id: 4,
    name: 'Калифорния',
    description: 'Краб, авокадо, икра тобико, майонез',
    price: 380,
    image: 'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJvbGxzfGVufDF8fHx8MTc2NDg3NjI4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Роллы',
    weight: '250г',
    fullDescription: 'Популярный ролл с крабом, авокадо и икрой тобико. Нежная текстура и яркий вкус не оставят вас равнодушными.',
    ingredients: 'Краб, авокадо, икра тобико, майонез японский, рис для суши, нори, кунжут',
  },
  {
    id: 5,
    name: 'Пицца Маргарита',
    description: 'Моцарелла, томатный соус, базилик',
    price: 450,
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHNsaWNlfGVufDF8fHx8MTc2NDgxMDU5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Пицца',
    weight: '500г',
    fullDescription: 'Классическая итальянская пицца с томатным соусом, моцареллой и свежим базиликом. Простота и совершенство вкуса.',
    ingredients: 'Тесто для пиццы, томатный соус, моцарелла, базилик свежий, оливковое масло',
  },
  {
    id: 6,
    name: 'Пицца Пепперони',
    description: 'Пепперони, моцарелла, томатный соус',
    price: 520,
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHNsaWNlfGVufDF8fHx8MTc2NDgxMDU5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Пицца',
    weight: '550г',
    fullDescription: 'Самая популярная пицца в мире! Щедрая порция пепперони на сочной моцарелле и томатном соусе.',
    ingredients: 'Тесто для пиццы, томатный соус, моцарелла, колбаса пепперони, орегано',
  },
  {
    id: 7,
    name: 'Картофель фри',
    description: 'Хрустящий картофель с солью и специями',
    price: 150,
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmcmllc3xlbnwxfHx8fDE3NjQ4OTIyNTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Закуски',
    weight: '200г',
    fullDescription: 'Золотистый картофель фри с хрустящей корочкой. Идеальная закуска к любому блюду!',
    ingredients: 'Картофель, растительное масло, соль, специи',
  },
  {
    id: 8,
    name: 'Куриные крылышки',
    description: 'Острые крылышки в пряном маринаде',
    price: 320,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwd2luZ3N8ZW58MXx8fHwxNzY0ODc3ODY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Закуски',
    weight: '400г',
    fullDescription: 'Сочные куриные крылышки в остром маринаде со специями. Для любителей пикантных блюд!',
    ingredients: 'Куриные крылышки, острый соус, чеснок, паприка, специи, кунжут',
  },
  {
    id: 9,
    name: 'Начос',
    description: 'Кукурузные чипсы с сырным соусом и халапеньо',
    price: 280,
    image: 'https://images.unsplash.com/photo-1690085664028-3b8465e4ac24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWNob3MlMjBmb29kfGVufDF8fHx8MTc2NDgxMjI4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Закуски',
    weight: '300г',
    fullDescription: 'Хрустящие кукурузные чипсы начос с горячим сырным соусом и острым халапеньо. Отличная закуска для компании!',
    ingredients: 'Чипсы начос, сырный соус чеддер, халапеньо, сметана, зеленый лук',
  },
];

const categories = ['Все', 'Роллы', 'Сеты', 'Пицца', 'Лапша ВОК', 'Бургеры', 'Сандвичи', 'Шаурма', 'Морепродукты', 'Ланч боксы', 'Закуски', 'Соусы', 'Десерты и напитки', 'Наборы', 'Салаты'];

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [currentPage, setCurrentPage] = useState('Главная');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const filteredProducts = selectedCategory === 'Все'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const renderPage = () => {
    switch (currentPage) {
      case 'Главная':
        return (
          <>
            <Hero />
            <div className="mb-12">
              <h2 className="text-white text-4xl mb-8">Популярные блюда</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          </>
        );
      case 'Новинки':
        return <NewItemsPage products={products} onAddToCart={addToCart} onViewDetails={handleViewDetails} />;
      case 'Меню':
        return (
          <MenuPage
            products={products}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onAddToCart={addToCart}
            onViewDetails={handleViewDetails}
          />
        );
      case 'Оплата и доставка':
        return <DeliveryPage />;
      case 'Акции':
        return <PromotionsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderPage()}
      </main>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-white text-4xl mb-8">Как нас найти</h2>
        <Map />
      </div>
      
      <Footer />
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
      
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={addToCart}
      />
    </div>
  );
}