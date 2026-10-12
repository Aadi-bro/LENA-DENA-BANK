import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/store';
import { Heart, ShoppingBag, Star, RotateCcw } from 'lucide-react';

interface AllProductsViewProps {
  onSelectProduct: (product: Product) => void;
}

export const AllProductsView: React.FC<AllProductsViewProps> = ({ onSelectProduct }) => {
  const {
    products,
    searchKeyword,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    clearAllFilters,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    defectMode,
  } = useStore();

  const categories = ['All', 'Electronics', 'Clothing', 'Footwear', 'Accessories', 'Home'];

  // Apply filters & search
  const filteredProducts = products.filter((product) => {
    // Search keyword
    if (searchKeyword.trim()) {
      const query = searchKeyword.toLowerCase().trim();
      const match =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      if (!match) return false;
    }

    // Category filter (TC_Filter_02)
    if (categoryFilter !== 'All' && product.category !== categoryFilter) {
      return false;
    }

    // Price range filter (TC_Filter_03)
    if (product.price < priceRange.min || product.price > priceRange.max) {
      return false;
    }

    return true;
  });

  // Sort By (TC_Filter_01)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'low-to-high') {
      return a.price - b.price;
    }
    if (sortBy === 'high-to-low') {
      return b.price - a.price;
    }
    return 0;
  });

  const handleCardWishlistClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    // DEFECT TC_LP_04: In defect mode, adding to wishlist from the product card fails!
    if (defectMode) {
      console.warn('Defect TC_LP_04 active: unable to add product on wishlist from card');
      // Does not add to wishlist to reproduce failure recorded in test sheet!
      return;
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCardBuyClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    // TC_LP_06: Add to bag from card
    addToCart(product, 1);
  };

  return (
    <div className="space-y-6" data-testid="all-products-page">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" data-testid="all-products-title">
            All Products
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse our curated collection with verified price, quality, and quick delivery.
          </p>
        </div>

        {/* Results Counter */}
        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-800">{sortedProducts.length}</span> of{' '}
          {products.length} products
        </div>
      </div>

      {/* Filter Control Bar */}
      <div
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4"
        data-testid="filter-control-panel"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* TC_Filter_02: Category Option */}
          <div>
            <label
              htmlFor="category-select"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Category
            </label>
            <select
              id="category-select"
              data-testid="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* TC_Filter_01: Sort by filter (Price: Low to High & High to Low) */}
          <div>
            <label
              htmlFor="sort-by-select"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Sort By
            </label>
            <select
              id="sort-by-select"
              data-testid="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'default' | 'low-to-high' | 'high-to-low')}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            >
              <option value="default">Featured / Default</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>

          {/* TC_Filter_03: Price Range Min to Max */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Price Range (₹{priceRange.min} - ₹{priceRange.max})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                data-testid="price-min-input"
                id="price-min-input"
                name="minPrice"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })
                }
                min={0}
                max={priceRange.max}
                className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:border-red-600"
                placeholder="Min ₹"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                data-testid="price-max-input"
                id="price-max-input"
                name="maxPrice"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: Number(e.target.value) || 5000 })
                }
                min={priceRange.min}
                max={10000}
                className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:border-red-600"
                placeholder="Max ₹"
              />
            </div>
          </div>

          {/* TC_Filter_04: Clear All Filter button */}
          <div className="flex items-end">
            <button
              type="button"
              data-testid="clear-all-filters-btn"
              onClick={clearAllFilters}
              className="w-full text-xs font-medium py-2 px-3 border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filter</span>
            </button>
          </div>
        </div>

        {/* Category Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Quick Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              data-testid={`category-pill-${cat.toLowerCase()}`}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-2.5 py-1 rounded-full shrink-0 transition-colors ${
                categoryFilter === cat
                  ? 'bg-red-700 text-white font-medium shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TC_LP_01: Product Listing Grid or TC_Search_02: No products found */}
      {sortedProducts.length === 0 ? (
        <div
          data-testid="no-products-found-banner"
          className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800" data-testid="no-products-msg">
            No products found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchKeyword
              ? `No products match your search keyword "${searchKeyword}". Try checking for spelling or clear search filters.`
              : 'No products match the selected filters. Please adjust category or price range.'}
          </p>
          <button
            type="button"
            data-testid="reset-filters-empty-btn"
            onClick={clearAllFilters}
            className="text-xs text-red-700 font-semibold hover:underline inline-block pt-2"
          >
            Clear applied filters
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          data-testid="products-grid"
        >
          {sortedProducts.map((product) => {
            const inWish = isInWishlist(product.id);
            return (
              <div
                key={product.id}
                data-testid={`product-card-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer"
              >
                {/* Image Container with Hover Zoom (TC_LP_02, TC_LP_03) */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    data-testid={`product-image-${product.id}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Category Badge */}
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                    {product.category}
                  </span>

                  {/* TC_LP_04: Add to Wishlist Icon on Product Card */}
                  <button
                    type="button"
                    data-testid={`card-wishlist-btn-${product.id}`}
                    aria-label={`Add ${product.name} to wishlist`}
                    onClick={(e) => handleCardWishlistClick(e, product)}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition-colors ${
                      inWish
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white/80 hover:bg-white text-slate-700 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${inWish ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Card Content (TC_DP_01) */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold text-slate-800">{product.rating}</span>
                      <span className="text-[11px] text-slate-400">({product.reviewsCount})</span>
                    </div>

                    <h3
                      data-testid={`product-title-${product.id}`}
                      className="font-semibold text-sm text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1"
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Buy Button (TC_LP_06) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-extrabold text-slate-900" data-testid={`product-price-${product.id}`}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-400 line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* TC_LP_06: Buy / Add to bag btn */}
                    <button
                      type="button"
                      data-testid={`buy-btn-${product.id}`}
                      onClick={(e) => handleCardBuyClick(e, product)}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
