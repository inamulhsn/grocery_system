"use client";

import React from 'react';
import { AlertTriangle, PackagePlus, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/grocery';

interface RefillListProps {
  products: Product[];
}

const RefillList = ({ products }: RefillListProps) => {
  const lowStockProducts = products.filter(p => p.stock_quantity < 20);

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <PackagePlus size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Inventory is Healthy</h2>
        <p className="text-slate-500">All products have sufficient stock levels.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Refill Required</h2>
          <p className="text-slate-500">Products with stock levels below 20 units</p>
        </div>
        <Badge variant="destructive" className="px-3 py-1 animate-pulse">
          {lowStockProducts.length} Items Low
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lowStockProducts.map((product) => (
          <Card key={product.id} className="p-5 border-red-100 bg-red-50/30 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center text-red-500">
                <AlertTriangle size={20} />
              </div>
              <Badge variant="outline" className="bg-white text-red-600 border-red-200">
                {product.stock_quantity} {product.unit} left
              </Badge>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 text-lg">{product.name}</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{product.category} • SKU: {product.sku}</p>
            </div>

            <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-xl group">
              Create Purchase Order <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RefillList;