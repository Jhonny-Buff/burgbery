import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { Cart, CartItem } from '@/components/Cart';
import { CheckoutForm } from '@/components/CheckoutForm';
import { MenuPage } from '@/components/MenuPage';
import { DeliveryPage } from '@/components/DeliveryPage';
import { PromotionsPage } from '@/components/PromotionsPage';
import { NewItemsPage } from '@/components/NewItemsPage';
import { Map } from '@/components/Map';
import { Footer } from '@/components/Footer';
import type { SiteSettings, Product, Category } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, getQueryFn, queryClient } from '@/lib/queryClient';
import { UserAccount, type UserDashboard } from '@/components/UserAccount';

interface LoyaltyRewardInfo {
  promoCode: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  usageLimit?: number | null;
  ordersThreshold: number;
  achievedOrders: number;
}


export default function Home() {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [currentPage, setCurrentPage] = useState('Главная');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/settings'],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: userDashboard, refetch: refetchDashboard } = useQuery<UserDashboard | null>({
    queryKey: ['/api/users/dashboard'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const currentUser = userDashboard?.user;
  const lastOrder = userDashboard?.lastOrder;

  const savedDetails = currentUser
    ? {
        customerName: currentUser.nickname,
        customerPhone: currentUser.phone,
        deliveryAddress: lastOrder?.deliveryAddress || '',
        deliveryType: (lastOrder?.deliveryType as 'courier' | 'pickup') || 'courier',
        paymentMethod: (lastOrder?.paymentMethod as 'cash' | 'card') || 'cash',
      }
    : undefined;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      const data = await response.json().catch(() => ({}));
      return { ...data, ok: response.ok, status: response.status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

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
    toast({
      title: 'Добавлено в корзину',
      description: product.name,
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

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSubmit = async (formData: any) => {
    const orderData = {
      ...formData,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productPrice: item.product.price,
        quantity: item.quantity,
      })),
    };

    try {
      const result = await createOrderMutation.mutateAsync(orderData);
      if (result.success && result.order) {
        await refetchDashboard();
        return {
          success: true,
          orderId: result.order.id,
          loyaltyReward: result.loyaltyReward as LoyaltyRewardInfo | undefined,
        };
      }

      return {
        success: false,
        message:
          result.message ||
          (result.status === 400
            ? 'Оформление сейчас недоступно'
            : 'Не удалось оформить заказ'),
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Ошибка оформления заказа' };
    }
  };

  const activeProducts = products.filter((p) => p.isActive);

  const renderPage = () => {
    switch (currentPage) {
      case 'Главная':
        return (
          <>
            <Hero onNavigate={setCurrentPage} heroImageUrl={settings?.heroImageUrl} />
            <div className="mb-8 md:mb-12">
              <h2 className="text-white text-3xl md:text-4xl mb-6 md:mb-8" data-testid="text-popular-title">Популярные блюда</h2>
              {productsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProducts.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        );
      case 'Новинки':
        return (
          <NewItemsPage
            products={products}
            onAddToCart={addToCart}
            onViewDetails={handleViewDetails}
            isLoading={productsLoading}
          />
        );
      case 'Меню':
        return (
          <MenuPage
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onAddToCart={addToCart}
            onViewDetails={handleViewDetails}
            isLoading={productsLoading || categoriesLoading}
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
        onAccountClick={() => setIsAccountOpen(true)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        logoUrl={settings?.logoImageUrl}
        userNickname={currentUser?.nickname}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {renderPage()}
      </main>
      
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <h2 className="text-white text-3xl md:text-4xl mb-6 md:mb-8" data-testid="text-map-title">Как нас найти</h2>
        <Map />
      </div>
      
      <Footer logoUrl={settings?.footerLogoImageUrl || settings?.logoImageUrl} />
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
      
      <ProductModal
        product={selectedProduct}
        categories={categories}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={addToCart}
      />

      <CheckoutForm
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onSubmit={handleOrderSubmit}
        onClearCart={clearCart}
        savedDetails={savedDetails}
      />

      {isAccountOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-auto py-10 px-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl" data-testid="user-account-panel">
            <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-zinc-800">
              <div>
                <p className="text-sm text-zinc-400">Личный кабинет</p>
                <h3 className="text-2xl text-white font-semibold">{currentUser ? currentUser.nickname : 'Вход и регистрация'}</h3>
              </div>
              <button
                onClick={() => setIsAccountOpen(false)}
                className="text-zinc-400 hover:text-white"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <UserAccount
                dashboard={userDashboard}
                onAuthChange={async () => {
                  await refetchDashboard();
                  setIsAccountOpen(true);
                }}
                onClose={() => setIsAccountOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
