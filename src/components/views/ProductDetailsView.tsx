import React, { useState } from 'react';
import { Product } from '../../types/store';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, Heart, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, Check } from 'lucide-react';

interface ProductDetailsViewProps {
  product: Product;
  onBack: () => void;
  onNavigateToCart: () => void;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({
  product,
  onBack,
  onNavigateToCart,
}) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    // TC_DP_04: Add to Bag
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleToggleWishlist = () => {
    // TC_DP_05: Add to Wishlist on details page
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const discountPercentage = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="product-details-view">
      {/* TC_DP_06: Back arrow button to list of products */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-testid="product-detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-red-700 bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        {addedToast && (
          <div
            data-testid="item-added-toast"
            className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Added to bag!</span>
            <button
              type="button"
              onClick={onNavigateToCart}
              className="font-bold underline text-emerald-900 ml-1"
            >
              View Bag
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Images + Product Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Gallery & Image Switching (TC_DP_02) */}
        <div className="space-y-4">
          {/* Main Featured Image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              data-testid="main-product-image"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Thumbnails switcher (TC_DP_02) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1" data-testid="image-thumbnails-list">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                data-testid={`thumbnail-image-${idx}`}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-red-600 ring-2 ring-red-100'
                    : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details, Price, Actions (TC_DP_01, TC_DP_04, TC_DP_05) */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded">
                {product.category}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                In Stock &amp; Ready to Ship
              </span>
            </div>

            {/* Product Name (TC_DP_01) */}
            <h1
              data-testid="product-details-name"
              className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
              </div>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 font-medium">{product.reviewsCount} Customer Reviews</span>
            </div>

            {/* Price (TC_DP_01) */}
            <div className="flex items-baseline gap-3 pt-2">
              <span
                data-testid="product-details-price"
                className="text-3xl font-extrabold text-slate-900"
              >
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Save {discountPercentage}%
              </span>
            </div>

            {/* Description (TC_DP_01) */}
            <div className="pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </h2>
              <p
                data-testid="product-details-description"
                className="text-sm text-slate-600 leading-relaxed"
              >
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="pt-2">
              <label htmlFor="product-qty-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <select
                  id="product-qty-select"
                  data-testid="product-quantity-select"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 text-xs rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-red-600"
                >
                  {[1, 2, 3, 4, 5, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'item' : 'items'}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-400">Standard domestic retail packaging</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Add to Bag & Add to Wishlist */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              {/* TC_DP_04: Add to Bag */}
              <button
                type="button"
                data-testid="add-to-bag-btn"
                onClick={handleAddToCart}
                className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Bag</span>
              </button>

              {/* TC_DP_05: Add to Wishlist */}
              <button
                type="button"
                data-testid="detail-wishlist-btn"
                onClick={handleToggleWishlist}
                aria-label="Add to wishlist"
                className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${
                  inWishlist
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50'
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 font-medium flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-slate-500" />
                <span>Fast Delivery</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 font-medium flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>100% Genuine</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 font-medium flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>7 Days Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TC_DP_03: Product Specifications */}
      <div
        className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-4"
        data-testid="product-specifications-section"
      >
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
          Product Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-xs">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Brand</span>
            <span className="font-bold text-slate-900" data-testid="spec-brand">
              {product.specifications.brand}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Material</span>
            <span className="font-bold text-slate-900" data-testid="spec-material">
              {product.specifications.material}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Warranty</span>
            <span className="font-bold text-slate-900" data-testid="spec-warranty">
              {product.specifications.warranty}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Dimensions</span>
            <span className="font-bold text-slate-900" data-testid="spec-dimensions">
              {product.specifications.dimensions}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">In The Box</span>
            <span className="font-bold text-slate-900" data-testid="spec-in-the-box">
              {product.specifications.inTheBox}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Model / SKU</span>
            <span className="font-bold text-slate-900 font-mono" data-testid="spec-sku">
              {product.specifications.sku}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
