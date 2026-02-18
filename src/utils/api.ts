"use client";

import { Product, Sale, SystemSettings, FeatureToggles, Profile } from '@/types/grocery';

const API_URL = '/api';

export const api = {

  getUsers: async (): Promise<Profile[]> => {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  },

  // Creates a new staff member in PostgreSQL
  saveUser: async (userData: Partial<Profile>): Promise<Profile> => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return await response.json();
  },

  updateUser: async (userData: any): Promise<void> => {
    // Ensure the ID is passed in the URL and the body matches the C# Model
    const response = await fetch(`${API_URL}/users/${userData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        fullName: userData.full_name, // Mapping camelCase to PascalCase
        role: userData.role,
        permissionsJson: userData.permissionsJson // This is the key fix!
      }),
    });
    if (!response.ok) throw new Error('Failed to update user');
  },

  // Deletes a user record from the database
  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  // --- PRODUCTS ---
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },
  
  getDailyTotal: async (): Promise<number> => {
    const response = await fetch(`${API_URL}/sales/daily-total`);
    return await response.json();
  },

  saveProduct: async (product: Product): Promise<Product> => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to save product');
    return res.json();
  },

  deleteProduct: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
  },

  // --- SALES ---
  getSales: async (): Promise<Sale[]> => {
    const res = await fetch(`${API_URL}/sales`);
    if (!res.ok) throw new Error('Failed to fetch sales');
    return res.json();
  },

  createSale: async (sale: Sale): Promise<Sale> => {
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    if (!res.ok) {
      let message = 'Failed to create sale';
      try {
        const data = await res.json();
        if (data) {
          if (typeof data === 'string') {
            message = data;
          } else if (typeof data.message === 'string') {
            message = data.message;
          }
        }
      } catch {
        try {
          const text = await res.text();
          if (text) message = text;
        } catch {
          // ignore
        }
      }
      throw new Error(message);
    }
    return res.json();
  },

  // --- SETTINGS ---
  getBranding: async (): Promise<SystemSettings> => {
    const res = await fetch(`${API_URL}/settings/branding`);
    return res.json();
  },

  saveBranding: async (settings: SystemSettings): Promise<SystemSettings> => {
    const res = await fetch(`${API_URL}/settings/branding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save branding');
    return res.json();
  },
  
  getFeatures: async (): Promise<FeatureToggles> => {
    const res = await fetch(`${API_URL}/settings/features`);
    return res.json();
  },

  // --- AUTH & USERS ---
  login: async (credentials: unknown) => {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },
};