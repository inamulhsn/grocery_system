"use client";

import { Product, Sale, SystemSettings, FeatureToggles, Profile } from '@/types/grocery';

const API_URL = '/api';

export const api = {
  // --- PRODUCTS ---
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to create sale');
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

  updateUser: async (user: Profile): Promise<Profile> => {
    const res = await fetch(`${API_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  }
};