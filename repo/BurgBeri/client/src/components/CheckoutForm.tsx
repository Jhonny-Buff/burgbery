import { useState, useCallback, useEffect } from 'react';
import { X, Loader2, Check, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CartItem } from './Cart';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { SimpleCaptcha } from './SimpleCaptcha';

interface LoyaltyRewardInfo {
  promoCode: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  usageLimit?: number | null;
  ordersThreshold: number;
  achievedOrders: number;
}

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  customerPhone: z.string()
    .min(10, 'Введите корректный номер телефона')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Некорректный формат номера'),
  deliveryType: z.enum(['courier', 'pickup'], {
    required_error: 'Выберите способ доставки',
  }),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card'], {
    required_error: 'Выберите способ оплаты',
  }),
  utensilsCount: z.number().min(0).max(20).default(1),
  promoCode: z.string().optional(),
}).refine((data) => {
  if (data.deliveryType === 'courier' && (!data.deliveryAddress || data.deliveryAddress.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Введите адрес доставки',
  path: ['deliveryAddress'],
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onSubmit: (data: CheckoutFormData) => Promise<{ success: boolean; message?: string; orderId?: number; loyaltyReward?: LoyaltyRewardInfo }>;
  onClearCart: () => void;
  savedDetails?: {
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryType?: 'courier' | 'pickup';
    paymentMethod?: 'cash' | 'card';
  };
}

export function CheckoutForm({ isOpen, onClose, cartItems, onSubmit, onClearCart, savedDetails }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: number; loyaltyReward?: LoyaltyRewardInfo } | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [workingState, setWorkingState] = useState<{ allowed: boolean; message: string; now: string }>(
    () => ({ allowed: true, message: '', now: '' })
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (promoDiscount / 100));
  const total = subtotal - discountAmount;

  const formatRewardValue = (reward: LoyaltyRewardInfo) =>
    reward.discountType === 'percent'
      ? `${reward.discountValue}%`
      : `${reward.discountValue} ₽`;

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      deliveryType: 'courier',
      deliveryAddress: '',
      paymentMethod: 'cash',
      utensilsCount: 1,
      promoCode: '',
    },
  });

  useEffect(() => {
    if (isOpen && savedDetails) {
      form.reset({
        customerName: savedDetails.customerName || '',
        customerPhone: savedDetails.customerPhone || '',
        deliveryType: savedDetails.deliveryType || 'courier',
        deliveryAddress: savedDetails.deliveryAddress || '',
        paymentMethod: savedDetails.paymentMethod || 'cash',
        utensilsCount: form.getValues('utensilsCount') ?? 1,
        promoCode: form.getValues('promoCode') || '',
      });
    }
  }, [savedDetails, isOpen]);

  const deliveryType = form.watch('deliveryType');

  const computeWorkingState = useCallback(() => {
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Moscow',
    });

    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Moscow',
    }).formatToParts(now);

    const hours = Number(parts.find((p) => p.type === 'hour')?.value || '0');
    const minutes = Number(parts.find((p) => p.type === 'minute')?.value || '0');
    const totalMinutes = hours * 60 + minutes;
    const allowed = totalMinutes >= 600 && totalMinutes <= 1365;

    return {
      allowed,
      now: formatter.format(now),
      message: allowed
        ? ''
        : 'Заказы принимаются с 10:00 до 22:45 по МСК. Попробуйте в рабочее время.',
    };
  }, []);

  useEffect(() => {
    setWorkingState(computeWorkingState());
    const timer = setInterval(() => setWorkingState(computeWorkingState()), 30000);
    return () => clearInterval(timer);
  }, [computeWorkingState]);

  const handleCaptchaVerify = useCallback((verified: boolean) => {
    setCaptchaVerified(verified);
  }, []);

  const checkPromoCode = async () => {
    const promoCode = form.getValues('promoCode');
    if (!promoCode || promoCode.trim() === '') {
      setPromoError('Введите промокод');
      return;
    }

    setCheckingPromo(true);
    setPromoError(null);

    try {
      const response = await fetch(`/api/promo-codes/validate/${promoCode}`);
      const data = await response.json();
      
      if (data.valid) {
        setPromoDiscount(data.discountPercent);
        setPromoError(null);
      } else {
        setPromoDiscount(0);
        setPromoError(data.message || 'Промокод недействителен');
      }
    } catch (error) {
      setPromoError('Ошибка проверки промокода');
      setPromoDiscount(0);
    } finally {
      setCheckingPromo(false);
    }
  };

  const handleSubmit = async (data: CheckoutFormData) => {
    if (!workingState.allowed) {
      setSubmitError(
        workingState.message || 'Заказы принимаются с 10:00 до 22:45 по МСК'
      );
      return;
    }

    if (!captchaVerified) {
      setSubmitError('Пожалуйста, пройдите проверку CAPTCHA');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await onSubmit(data);

      if (result.success && result.orderId) {
        setOrderSuccess({ orderId: result.orderId, loyaltyReward: result.loyaltyReward });
        onClearCart();
      } else {
        setSubmitError(result.message || 'Ошибка оформления заказа');
      }
    } catch (error) {
      setSubmitError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (orderSuccess) {
      setOrderSuccess(null);
    }
    form.reset();
    setCaptchaVerified(false);
    setSubmitError(null);
    setPromoDiscount(0);
    setPromoError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={handleClose}
        data-testid="checkout-overlay"
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-900 z-50 rounded-2xl shadow-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto m-4" data-testid="checkout-modal">
        <div className="sticky top-0 bg-zinc-900 p-6 border-b border-zinc-800 flex items-center justify-between z-10">
          <h2 className="text-white text-xl" data-testid="text-checkout-title">
            {orderSuccess ? 'Заказ оформлен!' : 'Оформление заказа'}
          </h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors"
            data-testid="button-close-checkout"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {orderSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-xl mb-2">Спасибо за заказ!</h3>
              <p className="text-zinc-400 mb-4">
                Ваш заказ №{orderSuccess.orderId} принят и ожидает подтверждения.
              </p>
              <p className="text-zinc-400 text-sm">
                Мы свяжемся с вами в ближайшее время для подтверждения.
              </p>
              {orderSuccess.loyaltyReward && (
                <div className="mt-4 bg-orange-500/10 border border-orange-500/40 rounded-lg p-4 text-left">
                  <p className="text-orange-300 font-semibold">
                    Бонус за {orderSuccess.loyaltyReward.ordersThreshold} заказов
                  </p>
                  <p className="text-white text-lg">
                    Промокод {orderSuccess.loyaltyReward.promoCode} на скидку {formatRewardValue(orderSuccess.loyaltyReward)}
                  </p>
                  <p className="text-zinc-300 text-sm">
                    {orderSuccess.loyaltyReward.usageLimit
                      ? `Доступно использований: ${orderSuccess.loyaltyReward.usageLimit}`
                      : 'Можно использовать без ограничений'}
                  </p>
                </div>
              )}
              <Button
                onClick={handleClose}
                className="mt-6 bg-orange-600 hover:bg-orange-700"
                data-testid="button-order-success-close"
              >
                Закрыть
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Ваше имя</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Введите ваше имя"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                          data-testid="input-customer-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Номер телефона</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="+7 (___) ___-__-__"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                          data-testid="input-customer-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Способ получения</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-3 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                            <RadioGroupItem value="courier" id="courier" className="border-zinc-500" data-testid="radio-courier" />
                            <label htmlFor="courier" className="text-white cursor-pointer flex-1">Курьером</label>
                          </div>
                          <div className="flex items-center space-x-3 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                            <RadioGroupItem value="pickup" id="pickup" className="border-zinc-500" data-testid="radio-pickup" />
                            <label htmlFor="pickup" className="text-white cursor-pointer flex-1">Самовывоз</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {deliveryType === 'courier' && (
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Адрес доставки</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Улица, дом, квартира, подъезд, этаж"
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
                            data-testid="input-delivery-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Способ оплаты</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-3 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                            <RadioGroupItem value="cash" id="cash" className="border-zinc-500" data-testid="radio-cash" />
                            <label htmlFor="cash" className="text-white cursor-pointer flex-1">Наличными</label>
                          </div>
                          <div className="flex items-center space-x-3 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                            <RadioGroupItem value="card" id="card" className="border-zinc-500" data-testid="radio-card" />
                            <label htmlFor="card" className="text-white cursor-pointer flex-1">Банковской картой</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="utensilsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Количество приборов</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="bg-zinc-800 border-zinc-700 text-white w-24"
                          data-testid="input-utensils-count"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promoCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Промокод</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Введите промокод"
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 uppercase"
                            data-testid="input-promo-code"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={checkPromoCode}
                          disabled={checkingPromo}
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                          data-testid="button-apply-promo"
                        >
                          {checkingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Применить'}
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-red-400 text-sm mt-1">{promoError}</p>
                      )}
                      {promoDiscount > 0 && (
                        <p className="text-green-400 text-sm mt-1">Скидка {promoDiscount}% применена!</p>
                      )}
                    </FormItem>
                  )}
                />

                <div className="border-t border-zinc-800 pt-4">
                  <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>Товаров: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      <span>{subtotal} ₽</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Скидка {promoDiscount}%</span>
                        <span>-{discountAmount} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white text-lg font-medium pt-2 border-t border-zinc-700">
                      <span>Итого:</span>
                      <span data-testid="text-checkout-total">{total} ₽</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-zinc-300">
                    <span>Текущее время (МСК)</span>
                    <span className="font-mono text-white">{workingState.now || '—'}</span>
                  </div>
                  {!workingState.allowed && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm" data-testid="text-working-hours-warning">
                      <AlertCircle className="w-4 h-4" />
                      <span>{workingState.message}</span>
                    </div>
                  )}
                </div>

                <SimpleCaptcha onVerify={handleCaptchaVerify} />

                {submitError && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span data-testid="text-submit-error">{submitError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || !captchaVerified || !workingState.allowed}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:text-zinc-400 py-6 text-lg"
                  data-testid="button-submit-order"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Оформление...
                    </>
                  ) : (
                    `Оформить заказ на ${total} ₽`
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </>
  );
}
