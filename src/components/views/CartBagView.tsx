import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartBagViewProps {
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
}

export const CartBagView: React.FC<CartBagViewProps> = ({
  onContinueShopping,
  onProceedToCheckout,
}) => {
  const { cart, updateCartQuantity, removeFromCart, defectMode } = useStore();

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 99;
  const total = subtotal + tax + shippingFee;

  // TC_NB_03: Empty Bag State
  if (cart.length === 0) {
    return (
      <div
        className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs"
        data-testid="empty-bag-container"
      >
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900" data-testid="empty-bag-message">
          Your bag is empty
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Looks like you haven&apos;t added any items to your shopping bag yet. Explore our latest arrivals and great deals.
        </p>
        <div className="pt-2">
          {/* TC_NB_03: Continue shopping button */}
          <button
            type="button"
            data-testid="continue-shopping-btn"
            onClick={onContinueShopping}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="cart-bag-view">
      <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" data-testid="bag-title">
            Shopping Bag
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your selected items before proceeding to checkout.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600">
          {cart.length} {cart.length === 1 ? 'Product' : 'Products'} in Bag
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items List (TC_AB_02) */}
        <div className="lg:col-span-2 space-y-4" data-testid="cart-items-list">
          {cart.map((item) => (
            <div
              key={item.product.id}
              data-testid={`cart-item-${item.product.id}`}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded">
                  {item.product.category}
                </span>
                <h3
                  data-testid={`cart-item-title-${item.product.id}`}
                  className="text-sm font-semibold text-slate-900"
                >
                  {item.product.name}
                </h3>
                <div className="text-xs font-bold text-slate-800">
                  ₹{item.product.price.toLocaleString('en-IN')}{' '}
                  <span className="text-slate-400 font-normal">per item</span>
                </div>
              </div>

              {/* Quantity Controls (TC_AB_01: Quantity Change with minus defect) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                  {/* TC_AB_01: Decrease Quantity button */}
                  <button
                    type="button"
                    data-testid={`quantity-decrease-btn-${item.product.id}`}
                    aria-label="Decrease quantity"
                    onClick={() => updateCartQuantity(item.product.id, -1)}
                    className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span
                    data-testid={`quantity-value-${item.product.id}`}
                    className={`px-3 py-1 text-xs font-bold min-w-[2rem] text-center ${
                      item.quantity < 0 ? 'text-rose-600 bg-rose-50' : 'text-slate-900'
                    }`}
                  >
                    {item.quantity}
                  </span>

                  {/* Increase Quantity button */}
                  <button
                    type="button"
                    data-testid={`quantity-increase-btn-${item.product.id}`}
                    aria-label="Increase quantity"
                    onClick={() => updateCartQuantity(item.product.id, 1)}
                    className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* TC_AB_04: Remove Item button (defect in defect mode) */}
                <button
                  type="button"
                  data-testid={`remove-cart-item-btn-${item.product.id}`}
                  aria-label={`Remove ${item.product.name}`}
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Total Item Price */}
              <div className="sm:text-right shrink-0 min-w-[5rem]">
                <div
                  data-testid={`item-total-price-${item.product.id}`}
                  className="text-sm font-extrabold text-slate-900"
                >
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}

          {/* Active Defect Notifier for tester */}
          {defectMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 space-y-1">
              <span className="font-bold">QA Tester Note (Seeded Defects):</span>
              <ul className="list-disc list-inside space-y-0.5">
                <li>
                  <strong>TC_AB_01:</strong> Decreasing quantity below 1 will go into negative numbers (e.g., 0, -1, -2).
                </li>
                <li>
                  <strong>TC_AB_04:</strong> Clicking the trash/remove icon does not remove the item.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Right: Order Summary & Checkout (TC_AB_03, TC_AB_05) */}
        <div className="space-y-4">
          <div
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4"
            data-testid="cart-order-summary"
          >
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span data-testid="cart-subtotal" className="font-semibold text-slate-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span data-testid="cart-tax" className="font-semibold text-slate-900">
                  ₹{tax.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span data-testid="cart-shipping-fee" className="font-semibold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              {shippingFee > 0 && (
                <p className="text-[10px] text-slate-400">
                  Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more to qualify for Free Shipping.
                </p>
              )}

              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span data-testid="cart-total-amount" className="text-base text-red-700">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* TC_AB_03: Checkout Button */}
            <button
              type="button"
              data-testid="checkout-btn"
              onClick={onProceedToCheckout}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Secure 256-bit encrypted checkout with verified seller protection.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
