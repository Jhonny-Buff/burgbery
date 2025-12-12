import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Product } from '@shared/schema';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  if (!isOpen) return null;
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
        data-testid="cart-overlay"
      />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 z-50 shadow-2xl border-l border-zinc-800 flex flex-col" data-testid="cart-panel">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-white text-xl" data-testid="text-cart-title">Ваша корзина</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            data-testid="button-close-cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12" data-testid="cart-empty">
              <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">Ваша корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-zinc-800 rounded-xl p-4 border border-zinc-700"
                  data-testid={`cart-item-${item.product.id}`}
                >
                  <div className="flex gap-4">
                    <img
                      src={item.product.image || 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?w=100'}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-white text-sm mb-1">{item.product.name}</h3>
                      <p className="text-orange-500 mb-3">{item.product.price} ₽</p>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="bg-zinc-700 hover:bg-zinc-600 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          data-testid={`button-decrease-${item.product.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="text-white min-w-[2rem] text-center" data-testid={`text-quantity-${item.product.id}`}>{item.quantity}</span>
                        
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="bg-zinc-700 hover:bg-zinc-600 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          data-testid={`button-increase-${item.product.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => onRemove(item.product.id)}
                          className="ml-auto text-red-500 hover:text-red-400 transition-colors"
                          data-testid={`button-remove-${item.product.id}`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400">Итого:</span>
              <span className="text-white text-2xl" data-testid="text-cart-total">{total} ₽</span>
            </div>
            
            <button 
              onClick={onCheckout}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl transition-colors"
              data-testid="button-checkout"
            >
              Оформить заказ
            </button>
          </div>
        )}
      </div>
    </>
  );
}
