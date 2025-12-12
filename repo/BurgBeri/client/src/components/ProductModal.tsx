import { X, Plus } from 'lucide-react';
import type { Product, Category } from '@shared/schema';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductModal({ product, categories, isOpen, onClose, onAddToCart }: ProductModalProps) {
  if (!isOpen || !product) return null;

  const category = categories.find(c => c.id === product.categoryId);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
        data-testid="modal-overlay"
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-zinc-900 z-50 rounded-2xl shadow-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto mx-4" data-testid="modal-product">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors z-10 bg-zinc-800 rounded-full p-2"
          data-testid="button-close-modal"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="relative h-64 md:h-full rounded-xl overflow-hidden">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?w=400'}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="img-modal-product"
            />
          </div>
          
          <div className="flex flex-col">
            {category && (
              <div className="mb-2">
                <span className="inline-block bg-orange-600/20 text-orange-500 px-3 py-1 rounded-full text-sm" data-testid="text-modal-category">
                  {category.name}
                </span>
              </div>
            )}
            
            <h2 className="text-white text-2xl md:text-3xl mb-4" data-testid="text-modal-product-name">{product.name}</h2>
            
            <p className="text-zinc-400 mb-6 leading-relaxed" data-testid="text-modal-description">
              {product.fullDescription || product.description}
            </p>
            
            {product.ingredients && (
              <div className="border-t border-zinc-800 pt-4 mb-6">
                <h3 className="text-white mb-3">Состав:</h3>
                <p className="text-zinc-400 text-sm" data-testid="text-modal-ingredients">
                  {product.ingredients}
                </p>
              </div>
            )}
            
            <div className="mt-auto">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-orange-500 text-3xl md:text-4xl" data-testid="text-modal-price">{product.price} ₽</span>
                <span className="text-zinc-500 text-sm">{product.weight || '350г'}</span>
              </div>
              
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                data-testid="button-modal-add-to-cart"
              >
                <Plus className="w-5 h-5" />
                <span>Добавить в корзину</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
