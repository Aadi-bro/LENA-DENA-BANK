import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../../types/store';

interface WishlistViewProps {
  onExploreProducts: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  onExploreProducts,
  onSelectProduct,
}) => {
  const { wishlist, removeFromWishlist, addToCart } = useStore();

  // TC_NB_04: When wishlist is empty
  if (wishlist.length === 0) {
    return (
      <div
        className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs"
        data-testid="empty-wishlist-container"
      >
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900" data-testid="empty-wishlist-message">
          Your wishlist is empty
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Save your favorite products here to buy them later or track exclusive discounts.
        </p>
        <div className="pt-2">
          {/* TC_NB_04: Explore products button */}
          <button
            type="button"
            data-testid="explore-products-btn"
            onClick={onExploreProducts}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="wishlist-view">
      <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" data-testid="wishlist-title">
            My Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Products you have saved for later purchase.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600">
          {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} Saved
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product.id}
            data-testid={`wishlist-card-${product.id}`}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div
              className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
              onClick={() => onSelectProduct(product)}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                data-testid={`wishlist-remove-btn-${product.id}`}
                aria-label={`Remove ${product.name} from wishlist`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWishlist(product.id);
                }}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-white shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3
                  onClick={() => onSelectProduct(product)}
                  className="font-semibold text-sm text-slate-900 hover:text-red-700 transition-colors cursor-pointer line-clamp-1"
                >
                  {product.name}
                </h3>
                <div className="text-sm font-extrabold text-slate-900 mt-1">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>

              <button
                type="button"
                data-testid={`wishlist-move-to-bag-btn-${product.id}`}
                onClick={() => {
                  addToCart(product, 1);
                  removeFromWishlist(product.id);
                }}
                className="w-full bg-red-700 hover:bg-red-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
