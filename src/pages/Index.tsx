"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Package, Settings, TrendingUp, Receipt, 
  ClipboardList, LogOut
} from 'lucide-react';
import POSInterface from '@/components/pos/POSInterface';
import InventoryManager from '@/components/inventory/InventoryManager';
import UserManagement from '@/components/admin/UserManagement';
import SalesHistory from '@/components/sales/SalesHistory';
import RefillList from '@/components/inventory/RefillList';
import AdminSecurity from '@/components/admin/AdminSecurity';
import BrandingSettings from '@/components/admin/BrandingSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Product, Sale, Profile, SystemSettings } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';
import { api } from '@/utils/api'; // Import our new API helper

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Initialize with empty arrays
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [branding, setBranding] = useState<SystemSettings>({ systemName: 'GroceryPro', logoUrl: '' });

  // Get user from local storage (Login persists user, but data comes from DB)
  const [currentUser, setCurrentUser] = useState<Profile>(() => {
    const saved = localStorage.getItem('grocery_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- 1. LOAD DATA FROM C# BACKEND ---
  const loadData = async () => {
    try {
      const [productsData, salesData, brandingData] = await Promise.all([
        api.getProducts(),
        api.getSales(),
        api.getBranding()
      ]);
      setProducts(productsData);
      setSales(salesData);
      setBranding(brandingData);
    } catch (error) {
      console.error("Failed to load data:", error);
      showError("Connection to server failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If not logged in, redirect
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadData();
  }, [currentUser, navigate]);

  // --- 2. HANDLE ACTIONS ---

  const handleCompleteSale = async (newSale: Sale) => {
    try {
      await api.createSale(newSale);
      showSuccess("Sale recorded successfully!");
      loadData(); // Reload to get updated stock
    } catch (error) {
      showError("Failed to record sale.");
    }
  };

  // This is passed to InventoryManager to refresh the list
  const handleProductChange = () => {
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('grocery_user');
    navigate('/login');
  };

  if (loading) return <div className="p-10 text-center">Loading system...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 overflow-hidden">
              {branding.logoUrl ? <img src={branding.logoUrl} className="w-full h-full object-cover" /> : <TrendingUp size={24} />}
            </div>
            <h1 className="text-xl font-black tracking-tight">{branding.systemName}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold">{currentUser?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{currentUser?.role}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogout} className="rounded-xl font-bold gap-2 px-4">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6">
        <Tabs defaultValue="pos" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-12 rounded-xl shadow-sm">
            <TabsTrigger value="pos" className="rounded-lg px-6"><ShoppingCart className="mr-2" size={18} /> POS</TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg px-6"><Receipt className="mr-2" size={18} /> Sales</TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-lg px-6"><Package className="mr-2" size={18} /> Inventory</TabsTrigger>
            <TabsTrigger value="refill" className="rounded-lg px-6"><ClipboardList className="mr-2" size={18} /> Refill</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg px-6"><Settings className="mr-2" size={18} /> Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="mt-0 outline-none">
            <POSInterface products={products} onCompleteSale={handleCompleteSale} />
          </TabsContent>

          <TabsContent value="sales" className="mt-0 outline-none">
            <SalesHistory sales={sales} />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0 outline-none">
            {/* We pass handleProductChange so InventoryManager can trigger a reload */}
            <InventoryManager products={products} onProductChanged={handleProductChange} />
          </TabsContent>

          <TabsContent value="refill" className="mt-0 outline-none">
            <RefillList products={products} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 outline-none space-y-6">
            <div className="text-center p-10 text-slate-500">Admin Settings moved to Database!</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;