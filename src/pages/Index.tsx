"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Package, Settings, TrendingUp, Receipt, 
  ClipboardList, LogOut, ShieldCheck, DollarSign, BarChart3, History, Users, Truck
} from 'lucide-react';
import { hasSectionAccess, hasPermission } from '@/utils/permissions';
import POSInterface from '@/components/pos/POSInterface';
import InventoryManager from '@/components/inventory/InventoryManager';
import UserManagement from '@/components/admin/UserManagement';
import SalesHistory from '@/components/sales/SalesHistory';
import RefillList from '@/components/inventory/RefillList';
import ActivityLogs from '@/components/admin/ActivityLogs';
import CustomerManager from '@/components/customers/CustomerManager';
import SupplierManager from '@/components/suppliers/SupplierManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import { Product, Sale, Profile, SystemSettings, UserPermissions, ActivityLog } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';
import { api } from '@/utils/api';

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [dailyStats, setDailyStats] = useState<{ total: number; count: number; profit?: number }>({ total: 0, count: 0 });
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [branding, setBranding] = useState<SystemSettings>({ systemName: 'GroceryPro', logoUrl: '' });

  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('grocery_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loadData = async () => {
    try {
      const isAdmin = currentUser?.role === 'admin';
      const promises = [
        api.getProducts(),
        api.getSales(),
        api.getBranding(),
        isAdmin ? api.getActivityLogs() : Promise.resolve([] as ActivityLog[]),
        api.getDailyStats(new Date())
      ] as const;
      const [productsData, salesData, brandingData, logsData, statsData] = await Promise.all(promises);
      setProducts(productsData || []);
      setSales(salesData || []);
      setLogs(logsData || []);
      if (brandingData) setBranding(brandingData);
      if (statsData) setDailyStats(statsData);
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

  // profit is now returned by the server; fall back to client computation if missing
  const stats = useMemo(() => {
    const { total: grossTotal, count, profit } = dailyStats;
    console.log('[stats] dailyStats:', dailyStats, 'profit:', profit);
    let netProfit = profit ?? 0;

    if (!profit && profit !== 0) {
      // calculate profit manually using product cost if server didn't provide it
      console.log('[stats] profit is falsy, computing client-side');
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
      const todaysSales = sales.filter(s => {
        const saleLocal = new Date(s.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
        return saleLocal === today;
      });
      todaysSales.forEach(sale => {
        sale.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const cost = product.costPrice * item.quantity;
            const revenue = item.totalPrice;
            netProfit += (revenue - cost);
          }
        });
      });
      console.log('[stats] client-computed profit:', netProfit);
    }

    return { grossTotal, netProfit, count };
  }, [dailyStats, sales, products]);

  const handleCompleteSale = async (newSale: Sale) => {
    try {
      await api.createSale(newSale);
      showSuccess("Transaction completed!");
      await loadData();
    } catch (error) {
      showError("Failed to process sale.");
    }
  };

  const handleUpdateBranding = async (newBranding: SystemSettings) => {
    try {
      const updated = await api.saveBranding(newBranding);
      setBranding(updated);
      showSuccess("System branding updated!");
      await loadData();
    } catch (error) {
      showError("Failed to update branding.");
    }
  };

  const handleUpdateAdminProfile = async (updatedProfile: Profile) => {
    try {
      await api.updateUser(updatedProfile);
      setCurrentUser(updatedProfile);
      localStorage.setItem('grocery_user', JSON.stringify(updatedProfile));
      showSuccess("Admin profile updated!");
      await loadData();
    } catch (error) {
      showError("Failed to update profile.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('grocery_user');
    navigate('/login');
  };


  if (loading) return <div className="p-10 text-center font-bold text-slate-400 dark:text-slate-500 animate-pulse">Initializing Secure Terminal...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary dark:bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 dark:shadow-slate-900/50 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
              {branding.logoUrl ? <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-cover dark:brightness-95" /> : <TrendingUp size={24} className="text-white dark:text-slate-200" />}
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">{branding.systemName}</h1>
            {currentUser?.role === 'admin' && (
              <Badge className="ml-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 gap-1">
                <ShieldCheck size={12} /> Super Admin
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser?.role === 'admin' && (
              <div className="hidden lg:flex items-center gap-6 px-4 border-r border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest flex items-center gap-1">
                    <DollarSign size={10} /> Today's Gross (DB)
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                    LKR {stats.grossTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest flex items-center gap-1">
                    <BarChart3 size={10} /> Today's Profit
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    LKR {stats.netProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest flex items-center gap-1">
                    <Receipt size={10} /> Today's Sales
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {stats.count}
                  </span>
                </div>
              </div>
            )}

            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentUser?.full_name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">{currentUser?.role}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 gap-2 px-4">
                <LogOut size={16} /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6">
        <Tabs defaultValue={hasSectionAccess('pos') ? "pos" : "inventory"} className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 h-12 rounded-xl shadow-sm overflow-x-auto max-w-full justify-start">
            {hasSectionAccess('pos') && (
              <TabsTrigger value="pos" className="rounded-lg px-6 text-slate-600 dark:text-slate-300 data-[state=active]:dark:text-slate-100 data-[state=active]:dark:bg-slate-800"><ShoppingCart className="mr-2" size={18} /> POS</TabsTrigger>
            )}
            {hasSectionAccess('sales') && (
              <TabsTrigger value="sales" className="rounded-lg px-6 text-slate-600 dark:text-slate-300 data-[state=active]:dark:text-slate-100 data-[state=active]:dark:bg-slate-800"><Receipt className="mr-2" size={18} /> Sales</TabsTrigger>
            )}
            {hasSectionAccess('inventory') && (
              <TabsTrigger value="inventory" className="rounded-lg px-6 text-slate-600 dark:text-slate-300 data-[state=active]:dark:text-slate-100 data-[state=active]:dark:bg-slate-800"><Package className="mr-2" size={18} /> Inventory</TabsTrigger>
            )}
            {hasSectionAccess('refill') && (
              <TabsTrigger value="refill" className="rounded-lg px-6 text-slate-600 dark:text-slate-300 data-[state=active]:dark:text-slate-100 data-[state=active]:dark:bg-slate-800"><ClipboardList className="mr-2" size={18} /> Refill</TabsTrigger>
            )}
            {/* Customers, Suppliers, Activity Logs, and Admin Panel are ADMIN ONLY */}
            {hasSectionAccess('customers') && (
              <TabsTrigger value="customers" className="rounded-lg px-6 text-slate-600 dark:text-slate-300 data-[state=active]:dark:text-slate-100 data-[state=active]:dark:bg-slate-800"><Users className="mr-2" size={18} /> Customers</TabsTrigger>
            )}
            {hasSectionAccess('suppliers') && (
              <TabsTrigger value="suppliers" className="rounded-lg px-6 text-slate-600 dark:text-slate-300 data-[state=active]:dark:text-slate-100 data-[state=active]:dark:bg-slate-800"><Truck className="mr-2" size={18} /> Suppliers</TabsTrigger>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="logs" className="rounded-lg px-6 text-slate-600 dark:text-slate-300 data-[state=active]:dark:text-slate-100 data-[state=active]:dark:bg-slate-800"><History className="mr-2" size={18} /> Activity Logs</TabsTrigger>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="settings" className="rounded-lg px-6 text-slate-600 dark:text-slate-300 data-[state=active]:dark:text-slate-100 data-[state=active]:dark:bg-slate-800"><Settings className="mr-2" size={18} /> Admin Panel</TabsTrigger>
            )}
          </TabsList>

          {hasSectionAccess('pos') && (
            <TabsContent value="pos" className="mt-0 outline-none">
              <POSInterface products={products} onCompleteSale={handleCompleteSale} />
            </TabsContent>
          )}

          {hasSectionAccess('sales') && (
            <TabsContent value="sales" className="mt-0 outline-none">
              <SalesHistory sales={sales} />
            </TabsContent>
          )}

          {hasSectionAccess('inventory') && (
            <TabsContent value="inventory" className="mt-0 outline-none">
              <InventoryManager products={products} onProductChanged={loadData} />
            </TabsContent>
          )}

          {hasSectionAccess('refill') && (
            <TabsContent value="refill" className="mt-0 outline-none">
              <RefillList products={products} />
            </TabsContent>
          )}

          {/* Configurable sections */}
          {hasSectionAccess('customers') && (
            <TabsContent value="customers" className="mt-0 outline-none">
              <CustomerManager />
            </TabsContent>
          )}

          {hasSectionAccess('suppliers') && (
            <TabsContent value="suppliers" className="mt-0 outline-none">
              <SupplierManager />
            </TabsContent>
          )}

          {currentUser?.role === 'admin' && (
            <TabsContent value="logs" className="mt-0 outline-none">
              <ActivityLogs logs={logs} onRevertLog={async (id) => { await api.revertActivityLog(id); await loadData(); }} />
            </TabsContent>
          )}

          {currentUser?.role === 'admin' && (
            <TabsContent value="settings" className="mt-0 outline-none">
              <UserManagement 
                branding={branding} 
                onUpdateBranding={handleUpdateBranding}
                currentUser={currentUser}
                onUpdateAdminProfile={handleUpdateAdminProfile}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;