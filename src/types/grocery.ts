export type UserRole = 'admin' | 'cashier' | 'manager' | 'hr';

export interface SectionPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  pos: SectionPermissions;
  inventory: SectionPermissions;
  sales: SectionPermissions;
  refill: SectionPermissions;
  customers: SectionPermissions;
  suppliers: SectionPermissions;
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
  costPrice: number;
  stockQuantity: number;
  refillThreshold: number;
  unit: string;
  discountPercentage: number;
  barcodeUrl?: string;

  // optional supplier info
  supplierId?: string;
  /** populated when API includes supplier relationship */
  supplier?: Supplier;

  /** encoded string stored in DB and used for barcode generation */
  barcodeValue?: string;
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
  /** Optional. Set when sale is linked to a known customer. */
  customerId?: string;
  /** Display name for receipt and sales list. If empty, show as "Customer". */
  customerName?: string;
  /** Customer mobile number for the sale. */
  customerPhone?: string;
}

export interface SystemSettings {
  systemName: string;
  logoUrl: string;
}

export interface ActivityLog {
  id: number;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  revertPayload?: string;
  /** When set, this log was reverted (action undone); Revert button is hidden. */
  revertedAt?: string | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  mobileNumber: string;
  whatsAppNumber: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  address: string;
  mobileNumber: string;
  whatsAppNumber: string;
}