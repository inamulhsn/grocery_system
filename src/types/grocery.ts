export type UserRole = 'admin' | 'cashier' | 'manager';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  unit: string;
  barcode_url?: string;
}

export interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: string;
  created_at: string;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'upi';
  cashier_id: string;
  items: SaleItem[];
}

export interface FeatureToggles {
  showProfitMargin: boolean;
  enableBarcodePrinting: boolean;
  allowPendingBills: boolean;
}