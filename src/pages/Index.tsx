"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Package, Settings, TrendingUp, Receipt, 
  ClipboardList, LogOut, ShieldCheck
} from 'lucide-react';
import POSInterface from '@/components/pos/POSInterface';
import InventoryManager from '@/components/inventory/InventoryManager';
import UserManagement from '@/components/admin/UserManagement';
import SalesHistory from '@/components/sales/SalesHistory';
import RefillList from '@/components/inventory/RefillList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, Sale, Profile, SystemSettings, UserPermissions } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';
import { api } from '@/utils/api';

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [branding, setBranding] = useState<SystemSettings>({ systemName: 'GroceryPro', logoUrl: '' });

  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('grocery_user');
    return saved ? JSON.parse(saved) : null;
  });

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
      showError("Connection to server failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadData();
  }, [currentUser, navigate]);

  const handleCompleteSale = async (newSale: Sale) => {
    try {
      await api.createSale(newSale);
      showSuccess("Sale recorded successfully!");
      loadData();
    } catch (error) {
      showError("Failed to record sale.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('grocery_user');
    navigate('/login');
  };

  // Helper to check permissions
  const hasAccess = (section: keyof UserPermissions) => {
    if (currentUser?.role === 'admin') return true;
    return currentUser?.permissions?.[section]?.view || false;
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400 animate-pulse">Initializing Secure Terminal...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 overflow-hidden">
              {branding.logoUrl ? <img src={branding.logoUrl} className="w-full h-full object-cover" /> : <TrendingUp size={24} />}
            </div>
            <h1 className="text-xl font-black tracking-tight">{branding.systemName}</h1>
            {currentUser?.role === 'admin' && (
              <Badge className="ml-2 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50 gap-1">
                <ShieldCheck size={12} /> Super Admin
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold">{currentUser?.full_name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{currentUser?.role}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-xl font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 gap-2 px-4">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6">
        <Tabs defaultValue={hasAccess('pos') ? "pos" : "inventory"} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-12 rounded-xl shadow-sm overflow-x-auto max-w-full justify-start">
            {hasAccess('pos') && (
              <TabsTrigger value="pos" className="rounded-lg px-6"><ShoppingCart className="mr-2" size={18} /> POS</TabsTrigger>
            )}
            {hasAccess('analytics') && (
              <TabsTrigger value="sales" className="rounded-lg px-6"><Receipt className="mr-2" size={18} /> Sales</TabsTrigger>
            )}
            {hasAccess('inventory') && (
              <TabsTrigger value="inventory" className="rounded-lg px-6"><Package className="mr-2" size={18} /> Inventory</TabsTrigger>
            )}
            {hasAccess('inventory') && (
              <TabsTrigger value="refill" className="rounded-lg px-6"><ClipboardList className="mr-2" size={18} /> Refill</TabsTrigger>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="settings" className="rounded-lg px-6"><Settings className="mr-2" size={18} /> Admin Panel</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="pos" className="mt-0 outline-none">
            <POSInterface products={products} onCompleteSale={handleCompleteSale} />
          </TabsContent>

          <TabsContent value="sales" className="mt-0 outline-none">
            <SalesHistory sales={sales} />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0 outline-none">
            <InventoryManager products={products} onProductChanged={loadData} />
          </TabsContent>

          <TabsContent value="refill" className="mt-0 outline-none">
            <RefillList products={products} />
          </TabsContent>

          {currentUser?.role === 'admin' && (
            <TabsContent value="settings" className="mt-0 outline-none">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;