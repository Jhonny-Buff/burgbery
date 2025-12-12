import { ProductCard } from './ProductCard';
import { Sparkles } from 'lucide-react';
import type { Product } from '@shared/schema';

interface NewItemsPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isLoading?: boolean;
}

export function NewItemsPage({ products, onAddToCart, onViewDetails, isLoading }: NewItemsPageProps) {
  const newProducts = products.filter(p => p.isNew && p.isActive);

  return (
    <div>
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
          <h2 className="text-white text-3xl md:text-4xl" data-testid="text-new-items-title">Новинки</h2>
        </div>
        <p className="text-zinc-400">Попробуйте наши новые блюда</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 animate-pulse">
              <div className="h-48 bg-zinc-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-zinc-800 rounded w-20" />
                  <div className="h-10 w-10 bg-zinc-800 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : newProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">Новинок пока нет. Следите за обновлениями!</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
