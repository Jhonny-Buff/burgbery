import { ProductCard } from './ProductCard';
import type { Product, Category } from '@shared/schema';

interface MenuPageProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isLoading?: boolean;
}

export function MenuPage({ 
  products, 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  onAddToCart, 
  onViewDetails,
  isLoading 
}: MenuPageProps) {
  const allCategories = [{ id: 0, name: 'Все', sortOrder: -1, isActive: true }, ...categories];
  
  const filteredProducts = selectedCategory === 'Все'
    ? products.filter(p => p.isActive)
    : products.filter((p) => {
        const cat = categories.find(c => c.id === p.categoryId);
        return cat?.name === selectedCategory && p.isActive;
      });

  return (
    <div>
      <div className="mb-8 md:mb-12">
        <h2 className="text-white text-3xl md:text-4xl mb-3" data-testid="text-menu-title">Меню</h2>
        <p className="text-zinc-400">Выберите категорию и добавьте блюда в корзину</p>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 mb-8">
        {allCategories.filter(c => c.isActive).map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.name)}
            data-testid={`button-category-${category.name}`}
            className={`px-3 md:px-4 py-2 md:py-3 rounded-xl text-center transition-all text-sm md:text-base ${
              selectedCategory === category.name
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 animate-pulse">
              <div className="h-48 bg-zinc-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-zinc-800 rounded w-20" />
                  <div className="h-10 w-10 bg-zinc-800 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">В этой категории пока нет товаров</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
