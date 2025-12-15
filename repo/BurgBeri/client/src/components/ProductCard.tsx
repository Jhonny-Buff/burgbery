import { Plus } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import type { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  return (
    <div 
      className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-orange-600 transition-all duration-300 group cursor-pointer"
      onClick={() => onViewDetails(product)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={product.image || 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?w=400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          data-testid={`img-product-${product.id}`}
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
            Новинка
          </span>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-white mb-2" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2" data-testid={`text-product-desc-${product.id}`}>{product.description}</p>
        
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-orange-500 text-xl block" data-testid={`text-product-price-${product.id}`}>{product.price} ₽</span>
            <span className="text-zinc-500 text-xs">{product.weight || '350г'}</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full transition-all hover:scale-110"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
