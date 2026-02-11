"use client";

import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, TrendingUp } from 'lucide-react';
import POSInterface from '@/components/pos/POSInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Sidebar / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight">Grocery<span className="text-primary">Pro</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold">Admin User</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Store Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
              AD
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6">
        <Tabs defaultValue="pos" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white border border-slate-200 p-1 h-12 rounded-xl shadow-sm">
              <TabsTrigger value="pos" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <ShoppingCart className="mr-2" size={18} /> POS
              </TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Package className="mr-2" size={18} /> Inventory
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <LayoutDashboard className="mr-2" size={18} /> Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Settings className="mr-2" size={18} /> Admin
              </TabsTrigger>
            </TabsList>
            
            <div className="hidden lg:flex items-center gap-6 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium">Daily Sales</span>
                <span className="font-black text-lg">$1,240.50</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium">Orders</span>
                <span className="font-black text-lg">42</span>
              </div>
            </div>
          </div>

          <TabsContent value="pos" className="mt-0 outline-none">
            <POSInterface />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0 outline-none">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center py-20">
              <Package size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-slate-800">Inventory Management</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Connect Supabase to start managing your products, stock levels, and barcode generation.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0 outline-none">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center py-20">
              <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-slate-800">Sales Analytics</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Real-time insights into your store's performance will appear here once sales data is available.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;