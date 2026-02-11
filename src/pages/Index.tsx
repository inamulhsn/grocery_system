"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  TrendingUp, 
  Receipt, 
  ClipboardList,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import POSInterface from '@/components/pos/POSInterface';
import InventoryManager from '@/components/inventory/InventoryManager';
import UserManagement from '@/components/admin/UserManagement';
import SalesHistory from '@/components/sales/SalesHistory';
import RefillList from '@/components/inventory/RefillList';
import AdminSecurity from '@/components/admin/AdminSecurity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Product, Sale, Profile } from '@/types/grocery';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('grocery_products');
    return saved ? JSON.parse(saved) : [
      { id: '1', sku: 'GR-001', name: 'Organic Bananas', category: 'Fruits', price: 2.99, cost_price: 1.5, stock_quantity: 150, refill_threshold: 20, unit: 'kg', discount_percentage: 0 },
      { id: '2', sku: 'GR-002', name: 'Whole Milk 1L', category: 'Dairy', price: 1.50, cost_price: 0.9, stock_quantity: 15, refill_threshold: 25, unit: 'pcs', discount_percentage: 10 },
      { id: '3', sku: 'GR-003', name: 'Sourdough Bread', category: 'Bakery', price: 4.25, cost_price: 2.1, stock_quantity: 12, refill_threshold: 15, unit: 'pcs', discount_percentage: 0 },
    ];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('grocery_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<Profile>(() => {
    const saved = localStorage.getItem('grocery_admin_profile');
    return saved ? JSON.parse(saved) : {
      id: '1',
      email: 'admin@grocerypro.com',
      username: 'admin',
      password: 'admin',
      full_name: 'Admin User',
      role: 'admin',
      phone_number: '+1234567890',
      permissions: { 
        pos: { view: true, create: true, edit: true, delete: true },
        inventory: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, create: true, edit: true, delete: true },
        admin: { view: true, create: true, edit: true, delete: true }
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('grocery_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('grocery_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('grocery_admin_profile', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleCompleteSale = (newSale: Sale) => {
    setSales(prev => [newSale, ...prev]);
    setProducts(prevProducts => prevProducts.map(product => {
      const soldItem = newSale.items.find(item => item.product_id === product.id);
      if (soldItem) {
        return {
          ...product,
          stock_quantity: Math.max(0, product.stock_quantity - soldItem.quantity)
        };
      }
      return product;
    }));
  };

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleUpdateAdminProfile = (updatedProfile: Profile) => {
    setCurrentUser(updatedProfile);
  };

  const handleLogout = () => {
    showSuccess("Logged out successfully");
    navigate('/login');
  };

  const totalDailySales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight">Grocery<span className="text-primary">Pro</span></h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold">{currentUser.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                {currentUser.full_name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            
            <div className="w-px h-8 bg-slate-200" />
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout}
              className="rounded-xl font-bold flex items-center gap-2 px-4"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6">
        <Tabs defaultValue="pos" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white border border-slate-200 p-1 h-12 rounded-xl shadow-sm overflow-x-auto">
              <TabsTrigger value="pos" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <ShoppingCart className="mr-2" size={18} /> POS
              </TabsTrigger>
              <TabsTrigger value="sales" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Receipt className="mr-2" size={18} /> Sales
              </TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Package className="mr-2" size={18} /> Inventory
              </TabsTrigger>
              <TabsTrigger value="refill" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <ClipboardList className="mr-2" size={18} /> Refill
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Settings className="mr-2" size={18} /> Admin
              </TabsTrigger>
            </TabsList>
            
            <div className="hidden lg:flex items-center gap-6 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium">Daily Sales</span>
                <span className="font-black text-lg">${totalDailySales.toFixed(2)}</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium">Orders</span>
                <span className="font-black text-lg">{sales.length}</span>
              </div>
            </div>
          </div>

          <TabsContent value="pos" className="mt-0 outline-none">
            <POSInterface products={products} onCompleteSale={handleCompleteSale} />
          </TabsContent>

          <TabsContent value="sales" className="mt-0 outline-none">
            <SalesHistory sales={sales} />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0 outline-none">
            <InventoryManager products={products} onUpdateProducts={handleUpdateProducts} />
          </TabsContent>

          <TabsContent value="refill" className="mt-0 outline-none">
            <RefillList products={products} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 outline-none space-y-6">
            <AdminSecurity adminProfile={currentUser} onUpdate={handleUpdateAdminProfile} />
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;