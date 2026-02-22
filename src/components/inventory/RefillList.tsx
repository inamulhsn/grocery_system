"use client";

import React, { useState } from 'react';
import { AlertTriangle, PackagePlus, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/grocery';
import { hasPermission } from '@/utils/permissions';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

interface RefillListProps {
  products: Product[];
}

const RefillList = ({ products }: RefillListProps) => {
  const canCreateOrder = hasPermission('refill','view');
  // Filter products where stock is at or below their specific threshold
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.refillThreshold);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleCreateOrder = (product: Product) => {
    const supplierPhone = product.supplier?.mobileNumber || product.supplier?.whatsAppNumber;
    if (supplierPhone && supplierPhone.trim() !== '') {
      setDialogMessage(`Supplier number: ${supplierPhone}`);
    } else {
      setDialogMessage('Supplier number not available');
    }
    setDialogOpen(true);
  };

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <PackagePlus size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Inventory is Healthy</h2>
        <p className="text-slate-500 dark:text-slate-400">All products have sufficient stock levels based on their thresholds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Refill Required</h2>
          <p className="text-slate-500 dark:text-slate-400">Products that have reached their custom refill thresholds</p>
        </div>
        <Badge variant="destructive" className="px-3 py-1 animate-pulse dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">
          {lowStockProducts.length} Items Low
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lowStockProducts.map((product) => (
          <Card key={product.id} className="p-5 border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-red-100 dark:border-red-800 flex items-center justify-center text-red-500 dark:text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-white dark:bg-slate-800 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800 font-black">
                  {product.stockQuantity} {product.unit} left
                </Badge>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase">Threshold: {product.refillThreshold}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{product.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400uppercase tracking-widest font-bold">{product.category} • SKU: {product.sku}</p>
            </div>

            {canCreateOrder && (
              <Button onClick={() => handleCreateOrder(product)} className="w-full bg-slate-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl group">
                Create Purchase Order <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </Card>
        ))}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p>{dialogMessage}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default RefillList;