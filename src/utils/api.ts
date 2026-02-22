"use client";

import { Product, Sale, SystemSettings, Profile, ActivityLog, Customer, Supplier } from '@/types/grocery';

const API_URL = '/api';

// pull current user helper out to shared module so permission helpers can also reuse it
import { getCurrentUser } from './auth';

/**
 * Safely parses JSON from a fetch response.
 * Handles empty bodies (204 No Content or null results) which cause "Unexpected end of JSON input"
 */
const safeJson = async (res: Response) => {
  try {
    const text = await res.text();
    if (!text || text.trim() === "") {
      return null;
    }
    return JSON.parse(text);
  } catch (error) {
    console.warn("API Warning: Could not parse JSON response", error);
    return null;
  }
};

/** Normalize object keys to camelCase so frontend always gets consistent shape (e.g. Id -> id) */
function toCamelCase(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => toCamelCase(item));
  return Object.keys(obj as Record<string, unknown>).reduce((acc: Record<string, unknown>, key: string) => {
    const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase());
    acc[camel] = toCamelCase((obj as Record<string, unknown>)[key]);
    return acc;
  }, {});
}

export const api = {
  // --- ACTIVITY LOGS ---
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    const res = await fetch(`${API_URL}/activitylogs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return (await safeJson(res)) || [];
  },

  /** Revert (undo) the action and remove the log entry */
  revertActivityLog: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/activitylogs/${id}/revert`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || 'Failed to revert');
    }
  },

  deleteActivityLog: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/activitylogs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete log');
  },

  logAction: async (
    action: string,
    details: string,
    options?: { entityType?: string; entityId?: string; revertPayload?: string }
  ) => {
    const user = getCurrentUser();
    try {
      await fetch(`${API_URL}/activitylogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || '0',
          userName: user?.full_name || user?.username || 'system',
          action,
          details,
          timestamp: new Date().toISOString(),
          entityType: options?.entityType,
          entityId: options?.entityId,
          revertPayload: options?.revertPayload
        }),
      });
    } catch (e) {
      console.error("Failed to log action", e);
    }
  },

  // --- USERS ---
  getUsers: async (): Promise<Profile[]> => {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    const raw = await safeJson(response);
    const users = Array.isArray(raw) ? raw : [];
    return users.map((u: any) => {
      // Parse permissions from JSON string if needed
      let permissions = {};
      if (u.permissionsJson) {
        try {
          permissions = typeof u.permissionsJson === 'string' ? JSON.parse(u.permissionsJson) : u.permissionsJson;
        } catch (e) {
          console.error('Failed to parse permissions', e);
        }
      }
      // If admin, ensure full permissions
      if (u.role === 'admin') {
        permissions = {
          pos: { view: true, create: true, edit: true, delete: true },
          inventory: { view: true, create: true, edit: true, delete: true },
          analytics: { view: true, create: true, edit: true, delete: true },
          admin: { view: true, create: true, edit: true, delete: true }
        };
      }
      return {
        ...toCamelCase(u),
        permissions
      } as Profile;
    });
  },

  saveUser: async (userData: Partial<Profile>): Promise<Profile> => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    const newUser = await safeJson(response);
    if (newUser) {
      await api.logAction('USER_CREATE', `Created staff member: ${newUser.fullName || newUser.username}`, {
        entityType: 'User',
        entityId: newUser.id
      });
    }
    return newUser;
  },

  updateUser: async (userData: Partial<Profile> & { id: string; permissionsJson?: string }): Promise<void> => {
    const name = userData.fullName ?? userData.full_name ?? userData.username;
    const response = await fetch(`${API_URL}/users/${userData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        fullName: name ?? userData.username,
        role: userData.role,
        permissionsJson: userData.permissionsJson,
        phoneNumber: userData.phone_number ?? ''
      }),
    });
    if (!response.ok) throw new Error('Failed to update user');
    await api.logAction('USER_UPDATE', `Updated staff member: ${name || userData.username}`);
  },

  deleteUser: async (id: string, userForRevert?: Profile): Promise<void> => {
    if (userForRevert) {
      const payload = {
        Id: userForRevert.id,
        Username: userForRevert.username,
        Email: userForRevert.email,
        FullName: userForRevert.full_name,
        Role: userForRevert.role,
        PermissionsJson: typeof userForRevert.permissions === 'object' ? JSON.stringify(userForRevert.permissions) : (userForRevert.permissions as string || '{}'),
        PhoneNumber: userForRevert.phone_number ?? ''
      };
      await api.logAction('USER_DELETE', `Deleted staff member ID: ${id}`, {
        entityType: 'User',
        entityId: id,
        revertPayload: JSON.stringify(payload)
      });
    } else {
      await api.logAction('USER_DELETE', `Deleted staff member ID: ${id}`, { entityType: 'User', entityId: id });
    }
    const response = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  // --- CUSTOMERS ---
  getCustomers: async (): Promise<Customer[]> => {
    const res = await fetch(`${API_URL}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    const raw = await safeJson(res);
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((c: Record<string, unknown>) => toCamelCase(c)) as Customer[];
  },

  /** Find customer by mobile or WhatsApp number. Returns null if not found (404). */
  getCustomerByPhone: async (phone: string): Promise<Customer | null> => {
    const trimmed = (phone || '').trim();
    if (!trimmed) return null;
    try {
      const res = await fetch(`${API_URL}/customers/by-phone/${encodeURIComponent(trimmed)}`);
      if (res.status === 404) return null;
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Failed to lookup customer');
        throw new Error(errorText || 'Failed to lookup customer');
      }
      const data = await safeJson(res);
      return data ? (toCamelCase(data) as Customer) : null;
    } catch (error) {
      console.error('getCustomerByPhone error:', error);
      throw error;
    }
  },

  createCustomer: async (data: Omit<Customer, 'id'> & { id?: string }): Promise<Customer> => {
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id: data.id || undefined }),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    const created = await safeJson(res);
    return toCamelCase(created) as Customer;
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<void> => {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id }),
    });
    if (!res.ok) throw new Error('Failed to update customer');
  },

  deleteCustomer: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete customer');
  },

  // --- SUPPLIERS ---
  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await fetch(`${API_URL}/suppliers`);
    if (!res.ok) throw new Error('Failed to fetch suppliers');
    const raw = await safeJson(res);
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((s: Record<string, unknown>) => toCamelCase(s)) as Supplier[];
  },

  createSupplier: async (data: Omit<Supplier, 'id'> & { id?: string }): Promise<Supplier> => {
    const res = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id: data.id || undefined }),
    });
    if (!res.ok) throw new Error('Failed to create supplier');
    const created = await safeJson(res);
    return toCamelCase(created) as Supplier;
  },

  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<void> => {
    const res = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id }),
    });
    if (!res.ok) throw new Error('Failed to update supplier');
  },

  deleteSupplier: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/suppliers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete supplier');
  },

  // --- PRODUCTS ---
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const raw = await safeJson(res);
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((p: Record<string, unknown>) => toCamelCase(p)) as Product[];
  },

  saveProduct: async (product: Product): Promise<Product> => {
    const isNew = !product.id;
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to save product');
    const saved = await safeJson(res);
    if (saved) {
      await api.logAction(isNew ? 'PRODUCT_CREATE' : 'PRODUCT_UPDATE', `${isNew ? 'Added' : 'Updated'} product: ${saved.name}`, {
        entityType: 'Product',
        entityId: saved.id
      });
    }
    return saved;
  },

  deleteProduct: async (id: string, productForRevert?: Product): Promise<void> => {
    if (productForRevert) {
      await api.logAction('PRODUCT_DELETE', `Deleted product ID: ${id}`, {
        entityType: 'Product',
        entityId: id,
        revertPayload: JSON.stringify(productForRevert)
      });
    } else {
      await api.logAction('PRODUCT_DELETE', `Deleted product ID: ${id}`, { entityType: 'Product', entityId: id });
    }
    const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // --- SALES ---
  getSales: async (): Promise<Sale[]> => {
    const res = await fetch(`${API_URL}/sales`);
    if (!res.ok) throw new Error('Failed to fetch sales');
    const raw = await safeJson(res);
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((s: Record<string, unknown>) => toCamelCase(s)) as Sale[];
  },

  createSale: async (sale: Sale): Promise<Sale> => {
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    if (!res.ok) throw new Error('Failed to create sale');
    const newSale = await safeJson(res);
    if (newSale) {
      await api.logAction('SALE_COMPLETE', `Completed sale #${newSale.id} for LKR ${newSale.totalAmount.toFixed(2)}`, {
        entityType: 'Sale',
        entityId: newSale.id
      });
    }
    return newSale;
  },

  // fetch daily revenue/count stats computed by server
  getDailyStats: async (forDate?: Date): Promise<{ total: number; count: number; profit?: number }> => {
    // optional date parameter to align with client timezone
    let url = `${API_URL}/sales/daily-stats`;
    if (forDate) {
      const isoDate = forDate.toISOString().split('T')[0]; // YYYY-MM-DD
      url += `?date=${encodeURIComponent(isoDate)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch daily stats');
    const raw = await safeJson(res);
    console.log('[getDailyStats] Server response:', raw);
    return typeof raw === 'object' && raw !== null
      ? {
          total: Number((raw as any).total) ?? 0,
          count: Number((raw as any).count) ?? 0,
          profit: (raw as any).profit != null ? Number((raw as any).profit) : 0
        }
      : { total: 0, count: 0, profit: 0 };
  },

  // --- SETTINGS ---
  getBranding: async (): Promise<SystemSettings> => {
    try {
      const res = await fetch(`${API_URL}/settings/branding`);
      const data = await safeJson(res);
      return data || { systemName: 'GroceryPro', logoUrl: '' };
    } catch (e) {
      return { systemName: 'GroceryPro', logoUrl: '' };
    }
  },

  saveBranding: async (settings: SystemSettings): Promise<SystemSettings> => {
    const previous = await api.getBranding();
    const res = await fetch(`${API_URL}/settings/branding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save branding');
    await api.logAction('BRANDING_UPDATE', `Updated system branding to: ${settings.systemName}`, {
      entityType: 'SystemSettings',
      revertPayload: JSON.stringify(previous)
    });
    const data = await safeJson(res);
    return data || settings;
  },

  login: async (credentials: unknown) => {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return await safeJson(res);
  },
};