import { ProductCard, Product } from './ProductCard';

interface MenuPageProps {
  products: Product[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const categories = [
  'Все',
  'Роллы',
  'Сеты',
  'Пицца',
  'Лапша ВОК',
  'Бургеры',
  'Сандвичи',
  'Шаурма',
  'Морепродукты',
  'Ланч боксы',
  'Закуски',
  'Соусы',
  'Десерты и напитки',
  'Наборы',
  'Салаты',
];

export function MenuPage({ products, selectedCategory, onCategorySelect, onAddToCart, onViewDetails }: MenuPageProps) {
  const filteredProducts = selectedCategory === 'Все'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-white text-4xl mb-3">Меню</h2>
        <p className="text-zinc-400">Выберите категорию и добавьте блюда в корзину</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`px-4 py-3 rounded-xl text-center transition-all ${
              selectedCategory === category
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}