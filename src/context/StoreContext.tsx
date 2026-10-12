import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, User, ShippingAddress } from '../types/store';
import { INITIAL_PRODUCTS, INITIAL_USER } from '../data/mockStoreData';

interface StoreContextType {
  currentUser: User | null;
  products: Product[];
  cart: CartItem[];
  wishlist: Product[];
  orders: Order[];
  
  // Search & Filter state
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortBy: 'default' | 'low-to-high' | 'high-to-low';
  setSortBy: (sort: 'default' | 'low-to-high' | 'high-to-low') => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  clearAllFilters: () => void;

  // Cart operations
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Wishlist operations
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // User auth
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Orders
  placeOrder: (shippingAddress: ShippingAddress, paymentMethod: 'Netbanking' | 'UPI' | 'Cards') => Order;
  lastOrder: Order | null;
  setLastOrder: (order: Order | null) => void;

  // QA & Defect Simulation
  defectMode: boolean; // default true to match user's QA test spreadsheet exactly
  setDefectMode: (enabled: boolean) => void;
  resetStoreData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_PREFIX = 'lenadena_store_v1_';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}user`);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}cart`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}wishlist`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}orders`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'low-to-high' | 'high-to-low'>('default');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 500, max: 5000 });

  // Defect mode: defaults to true to simulate the exact test case spreadsheet
  const [defectMode, setDefectMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}defectMode`);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}cart`, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}wishlist`, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}defectMode`, JSON.stringify(defectMode));
  }, [defectMode]);

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const newQty = item.quantity + delta;

        // DEFECT TC_AB_01: In defect mode, quantity goes into negative numbers!
        if (defectMode) {
          return { ...item, quantity: newQty };
        } else {
          // Expected clean behavior: strictly positive
          return { ...item, quantity: Math.max(1, newQty) };
        }
      })
    );
  };

  const removeFromCart = (productId: string) => {
    // DEFECT TC_AB_04: In defect mode, remove button is broken / doesn't remove!
    if (defectMode) {
      // Intentionally does not remove to match test case defect TC_AB_04
      console.warn('Defect TC_AB_04 active: Remove button is not removing item from cart');
      return;
    }
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist actions
  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Auth actions
  const login = async (email: string, password: string): Promise<boolean> => {
    // Valid registered test credentials from sheet
    if (email === 'wofenap175@duidir.com' && password === '123456') {
      const user: User = {
        id: 'usr_001',
        email,
        name: 'Test Tester',
      };
      setCurrentUser(user);
      return true;
    }

    // Also support any dynamically created user
    try {
      const storedUsersRaw = localStorage.getItem(`${STORAGE_PREFIX}registered_users`);
      if (storedUsersRaw) {
        const storedUsers = JSON.parse(storedUsersRaw);
        const match = storedUsers.find((u: { email: string; pass: string }) => u.email === email && u.pass === password);
        if (match) {
          const user: User = {
            id: `usr_${Date.now()}`,
            email: match.email,
            name: match.name || 'Registered Customer',
          };
          setCurrentUser(user);
          return true;
        }
      }
    } catch {
      // fallback
    }

    throw new Error('Invalid email or password. Please check your credentials.');
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const user: User = {
      id: `usr_${Date.now()}`,
      email,
      name: name || 'Valued Shopper',
    };

    // Save to registered users list
    try {
      const storedUsersRaw = localStorage.getItem(`${STORAGE_PREFIX}registered_users`);
      const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      storedUsers.push({ name, email, pass: password });
      localStorage.setItem(`${STORAGE_PREFIX}registered_users`, JSON.stringify(storedUsers));
    } catch (e) {
      console.error(e);
    }

    setCurrentUser(user);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Filter clear action
  const clearAllFilters = () => {
    // DEFECT TC_Filter_04: In defect mode, clicking clear all filter leaves filters unchanged!
    if (defectMode) {
      console.warn('Defect TC_Filter_04 active: Clear filters button remains unchanged');
      return;
    }
    setCategoryFilter('All');
    setSortBy('default');
    setPriceRange({ min: 500, max: 5000 });
    setSearchKeyword('');
  };

  // Place order
  const placeOrder = (
    shippingAddress: ShippingAddress,
    paymentMethod: 'Netbanking' | 'UPI' | 'Cards'
  ): Order => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.18);
    const shippingFee = subtotal > 1000 ? 0 : 99;
    const total = subtotal + tax + shippingFee;

    const newOrder: Order = {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      items: [...cart],
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shippingFee,
      total,
      status: 'Confirmed',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastOrder(newOrder);
    setCart([]); // Empty bag after successful order (TC_OC_02)
    return newOrder;
  };

  const resetStoreData = () => {
    setCurrentUser(INITIAL_USER);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setLastOrder(null);
    setSearchKeyword('');
    setCategoryFilter('All');
    setSortBy('default');
    setPriceRange({ min: 500, max: 5000 });
    localStorage.removeItem(`${STORAGE_PREFIX}cart`);
    localStorage.removeItem(`${STORAGE_PREFIX}wishlist`);
    localStorage.removeItem(`${STORAGE_PREFIX}orders`);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        products,
        cart,
        wishlist,
        orders,
        searchKeyword,
        setSearchKeyword,
        categoryFilter,
        setCategoryFilter,
        sortBy,
        setSortBy,
        priceRange,
        setPriceRange,
        clearAllFilters,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        login,
        signup,
        logout,
        placeOrder,
        lastOrder,
        setLastOrder,
        defectMode,
        setDefectMode,
        resetStoreData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
