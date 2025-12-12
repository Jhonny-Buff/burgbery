import { ProductCard, Product } from './ProductCard';
import { Sparkles } from 'lucide-react';

interface NewItemsPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function NewItemsPage({ products, onAddToCart, onViewDetails }: NewItemsPageProps) {
  // Показываем только первые 6 продуктов как новинки
  const newProducts = products.slice(0, 6);

  return (
    <div>
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-10 h-10 text-orange-500" />
          <h2 className="text-white text-4xl">Новинки</h2>
        </div>
        <p className="text-zinc-400">Попробуйте наши новые блюда</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newProducts.map((product) => (
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