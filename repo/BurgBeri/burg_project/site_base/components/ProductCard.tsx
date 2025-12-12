import { Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  weight?: string;
  fullDescription?: string;
  ingredients?: string;
}

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
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      <div className="p-5">
        <h3 className="text-white mb-2">{product.name}</h3>
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-orange-500 text-xl block">{product.price} ₽</span>
            <span className="text-zinc-500 text-xs">{product.weight || '350г'}</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full transition-all hover:scale-110"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}