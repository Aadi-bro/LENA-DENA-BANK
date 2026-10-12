export interface Product {
  id: string;
  name: string;
  category: 'Electronics' | 'Clothing' | 'Footwear' | 'Accessories' | 'Home';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  description: string;
  images: string[];
  specifications: {
    material: string;
    brand: string;
    warranty: string;
    dimensions: string;
    inTheBox: string;
    sku: string;
  };
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
}

export interface Order {
  orderId: string;
  date: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'Netbanking' | 'UPI' | 'Cards';
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
}

export interface User {
  id: string;
  email: string;
  name: string;
}
