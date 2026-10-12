import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingAddress } from '../../types/store';
import {
  MapPin,
  CreditCard,
  Building,
  Smartphone,
  ShieldCheck,
  Trash2,
  Edit2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface CheckoutViewProps {
  onOrderCompleted: () => void;
  onBackToCart: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onOrderCompleted,
  onBackToCart,
}) => {
  const { cart, removeFromCart, placeOrder, defectMode } = useStore();

  const [step, setStep] = useState<'address' | 'review' | 'payment'>('address');

  // Address fields
  const [fullName, setFullName] = useState('Rahul Verma');
  const [addressLine, setAddressLine] = useState('Flat 402, Shanti Heights, MG Road');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('400001');
  const [phone, setPhone] = useState('9876543210');

  // Error state for TC_CO_05
  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});

  // Payment method (TC_CO_07)
  const [paymentMethod, setPaymentMethod] = useState<'Netbanking' | 'UPI' | 'Cards'>('UPI');
  const [upiId, setUpiId] = useState('tester@okaxis');
  const [selectedBank, setSelectedBank] = useState('Lena Dena Bank');
  const [cardNumber, setCardNumber] = useState('4532 8912 3456 7890');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('889');

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 99;
  const total = subtotal + tax + shippingFee;

  // Validate address form (TC_CO_01, TC_CO_05)
  const handleValidateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // TC_CO_05: Mandatory fields validation
    if (!fullName.trim()) errors.fullName = 'Full Name is required';
    if (!addressLine.trim()) errors.addressLine = 'Street address is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!state.trim()) errors.state = 'State is required';
    if (!pinCode.trim() || pinCode.trim().length !== 6) errors.pinCode = 'Valid 6-digit PIN code required';
    if (!phone.trim() || phone.trim().length !== 10) errors.phone = 'Valid 10-digit phone number required';

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    setAddressErrors({});
    // TC_CO_01: Valid shipping address accepted, proceed to review
    setStep('review');
  };

  // DEFECT TC_CO_06: Edit option in order review
  const handleEditClick = () => {
    if (defectMode) {
      // In defect mode, Edit button is NOT clickable / inert!
      console.warn('Defect TC_CO_06 active: Edit button is not clickable');
      return;
    }
    // Fixed mode: returns to address step to edit
    setStep('address');
  };

  // Place order
  const handlePlaceOrder = () => {
    const shippingAddress: ShippingAddress = {
      fullName,
      addressLine,
      city,
      state,
      pinCode,
      phone,
    };

    placeOrder(shippingAddress, paymentMethod);
    onOrderCompleted();
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <h2 className="text-base font-bold text-slate-800">No items to checkout</h2>
        <button
          type="button"
          onClick={onBackToCart}
          className="text-xs bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="checkout-view">
      {/* Checkout Progress Stepper */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" data-testid="checkout-title">
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete your order with verified address and fast payment
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`px-2.5 py-1 rounded-full ${
              step === 'address'
                ? 'bg-red-700 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            1. Address
          </span>
          <span className="text-slate-300">→</span>
          <span
            className={`px-2.5 py-1 rounded-full ${
              step === 'review'
                ? 'bg-red-700 text-white'
                : step === 'payment'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            2. Review
          </span>
          <span className="text-slate-300">→</span>
          <span
            className={`px-2.5 py-1 rounded-full ${
              step === 'payment'
                ? 'bg-red-700 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            3. Payment
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Step Area (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* STEP 1: Shipping Address (TC_CO_01, TC_CO_05) */}
          {step === 'address' && (
            <div
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4"
              data-testid="shipping-address-section"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-5 h-5 text-red-700" />
                <h2 className="text-sm font-bold text-slate-900">1. Shipping Address</h2>
              </div>

              <form onSubmit={handleValidateAddress} className="space-y-4" data-testid="shipping-address-form">
                <div>
                  <label htmlFor="fullname-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullname-input"
                    data-testid="shipping-fullname-input"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter recipient's full name"
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                      addressErrors.fullName
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-slate-300 focus:border-red-600'
                    }`}
                  />
                  {addressErrors.fullName && (
                    <span data-testid="error-fullname" className="text-[11px] text-rose-600 mt-0.5 block">
                      {addressErrors.fullName}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="address-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address / House No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address-input"
                    data-testid="shipping-address-input"
                    name="addressLine"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Street, building, area"
                    className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                      addressErrors.addressLine
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-slate-300 focus:border-red-600'
                    }`}
                  />
                  {addressErrors.addressLine && (
                    <span data-testid="error-address" className="text-[11px] text-rose-600 mt-0.5 block">
                      {addressErrors.addressLine}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city-input" className="block text-xs font-semibold text-slate-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city-input"
                      data-testid="shipping-city-input"
                      name="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                        addressErrors.city
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-slate-300 focus:border-red-600'
                      }`}
                    />
                    {addressErrors.city && (
                      <span data-testid="error-city" className="text-[11px] text-rose-600 mt-0.5 block">
                        {addressErrors.city}
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state-input" className="block text-xs font-semibold text-slate-700 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="state-input"
                      data-testid="shipping-state-input"
                      name="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                        addressErrors.state
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-slate-300 focus:border-red-600'
                      }`}
                    />
                    {addressErrors.state && (
                      <span data-testid="error-state" className="text-[11px] text-rose-600 mt-0.5 block">
                        {addressErrors.state}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pincode-input" className="block text-xs font-semibold text-slate-700 mb-1">
                      PIN Code (6 Digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="pincode-input"
                      data-testid="shipping-pincode-input"
                      name="pinCode"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="400001"
                      className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                        addressErrors.pinCode
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-slate-300 focus:border-red-600'
                      }`}
                    />
                    {addressErrors.pinCode && (
                      <span data-testid="error-pincode" className="text-[11px] text-rose-600 mt-0.5 block">
                        {addressErrors.pinCode}
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone-input" className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Phone (10 Digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="phone-input"
                      data-testid="shipping-phone-input"
                      name="phone"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${
                        addressErrors.phone
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-slate-300 focus:border-red-600'
                      }`}
                    />
                    {addressErrors.phone && (
                      <span data-testid="error-phone" className="text-[11px] text-rose-600 mt-0.5 block">
                        {addressErrors.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3">
                  {/* TC_CO_01 & TC_CO_05: Submit Address */}
                  <button
                    type="submit"
                    data-testid="continue-to-review-btn"
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Save Address &amp; Review Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Order Review & Items (TC_CO_02, TC_CO_04, TC_CO_06) */}
          {step === 'review' && (
            <div className="space-y-4">
              {/* Shipping Address Summary with Edit Option (TC_CO_06) */}
              <div
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-start justify-between"
                data-testid="order-review-address-box"
              >
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Delivering To:
                  </div>
                  <div className="text-sm font-bold text-slate-900">{fullName}</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {addressLine}, {city}, {state} - {pinCode}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Phone: +91 {phone}</div>
                </div>

                {/* TC_CO_06: Edit option for order review (broken in defect mode!) */}
                <button
                  type="button"
                  data-testid="edit-shipping-address-btn"
                  onClick={handleEditClick}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    defectMode
                      ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-60'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-red-700'
                  }`}
                  title={defectMode ? 'Defect TC_CO_06: Edit button is not clickable' : 'Edit address'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Items List in Review (TC_CO_02, TC_CO_04) */}
              <div
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
                data-testid="order-review-items-list"
              >
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Review Products ({cart.length})
                </div>

                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    data-testid={`review-item-${item.product.id}`}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">{item.product.name}</h4>
                        <span className="text-[11px] text-slate-500">
                          Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* TC_CO_04: Remove product from checkout */}
                      <button
                        type="button"
                        data-testid={`checkout-remove-btn-${item.product.id}`}
                        aria-label={`Remove ${item.product.name} from checkout`}
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* TC_CO_03: Continue to payment button */}
              <button
                type="button"
                data-testid="continue-to-payment-btn"
                onClick={() => setStep('payment')}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue to Payment Options</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Payment Options (TC_CO_07, TC_CO_08) */}
          {step === 'payment' && (
            <div
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5"
              data-testid="payment-options-section"
            >
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Select Payment Method</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose from Netbanking, UPI, or Credit/Debit Cards
                </p>
              </div>

              {/* TC_CO_07: Netbanking, UPI or Cards */}
              <div className="space-y-3" data-testid="payment-methods-radio-group">
                {/* 1. UPI */}
                <label
                  data-testid="payment-option-upi"
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'UPI'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-red-700" />
                      <span className="text-xs font-bold text-slate-900">UPI Instant Payment (GPay / PhonePe / Paytm)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pay directly using your Virtual Payment Address (VPA)</p>
                    {paymentMethod === 'UPI' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          data-testid="upi-id-input"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* 2. Netbanking */}
                <label
                  data-testid="payment-option-netbanking"
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'Netbanking'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value="Netbanking"
                    checked={paymentMethod === 'Netbanking'}
                    onChange={() => setPaymentMethod('Netbanking')}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-red-700" />
                      <span className="text-xs font-bold text-slate-900">Net Banking</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">All major Indian banks supported</p>
                    {paymentMethod === 'Netbanking' && (
                      <div className="mt-2">
                        <select
                          data-testid="netbanking-bank-select"
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                        >
                          <option value="Lena Dena Bank">Lena Dena Bank</option>
                          <option value="State Bank of India">State Bank of India</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Punjab National Bank">Punjab National Bank</option>
                        </select>
                      </div>
                    )}
                  </div>
                </label>

                {/* 3. Cards */}
                <label
                  data-testid="payment-option-cards"
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'Cards'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value="Cards"
                    checked={paymentMethod === 'Cards'}
                    onChange={() => setPaymentMethod('Cards')}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-red-700" />
                      <span className="text-xs font-bold text-slate-900">Credit / Debit Card (RuPay, Visa, Mastercard)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Instant OTP verification with zero surcharge</p>
                    {paymentMethod === 'Cards' && (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          data-testid="card-number-input"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="Card Number"
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            data-testid="card-expiry-input"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                          />
                          <input
                            type="password"
                            data-testid="card-cvv-input"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="CVV"
                            maxLength={3}
                            className="text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-red-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Complete Order Button (TC_CO_08) */}
              <div className="pt-2">
                <button
                  type="button"
                  data-testid="complete-order-btn"
                  onClick={handlePlaceOrder}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pay ₹{total.toLocaleString('en-IN')} &amp; Complete Order</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              Order Breakdown
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="font-semibold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Due</span>
                <span className="text-red-700 font-extrabold">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Buyer Protection Guarantee</span>
            </div>
            <p>Every order on Lena Dena Store is verified with digital invoice and tamper-proof tracking.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
