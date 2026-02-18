export type UserRole = 'admin' | 'cashier' | 'manager';

export interface SectionPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  pos: SectionPermissions;
  inventory: SectionPermissions;
  analytics: SectionPermissions;
  admin: SectionPermissions;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  permissions: UserPermissions;
  phone_number?: string;
  password?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;           // Changed from cost_price
  stockQuantity: number;       // Changed from stock_quantity
  refillThreshold: number;     // Changed from refill_threshold
  unit: string;
  discountPercentage: number;  // Changed from discount_percentage
  barcodeUrl?: string;         // Changed from barcode_url
}
export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  cashierId: string;
  items: SaleItem[];
}

export interface SystemSettings {
  systemName: string;
  logoUrl: string;
}

export interface FeatureToggles {
  showProfitMargin: boolean;
  enableBarcodePrinting: boolean;
  allowPendingBills: boolean;
}