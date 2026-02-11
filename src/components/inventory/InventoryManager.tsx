"use client";

import React, { useState } from 'react';
import { Package, Plus, Search, Barcode, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Product } from '@/types/grocery';
import BarcodeGenerator from './BarcodeGenerator';

const InventoryManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Mock data for inventory
  const [products] = useState<Product[]>([
    { id: '1', sku: 'GR-001', name: 'Organic Bananas', category: 'Fruits', price: 2.99, cost_price: 1.5, stock_quantity: 150, unit: 'kg' },
    { id: '2', sku: 'GR-002', name: 'Whole Milk 1L', category: 'Dairy', price: 1.50, cost_price: 0.9, stock_quantity: 15, unit: 'pcs' },
    { id: '3', sku: 'GR-003', name: 'Sourdough Bread', category: 'Bakery', price: 4.25, cost_price: 2.1, stock_quantity: 12, unit: 'pcs' },
  ]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search inventory..." 
            className="pl-10 bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6">
          <Plus className="mr-2" size={18} /> Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden border-slate-200 shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Product</TableHead>
                <TableHead className="font-bold">SKU</TableHead>
                <TableHead className="font-bold">Stock</TableHead>
                <TableHead className="font-bold">Price</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-bold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{product.sku}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock_quantity < 20 ? "destructive" : "secondary"} className="rounded-md">
                      {product.stock_quantity} {product.unit}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)}>
                        <Barcode size={16} className="text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit3 size={16} className="text-slate-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6 border-slate-200 shadow-sm bg-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Barcode className="text-primary" size={20} /> Barcode Preview
          </h3>
          {selectedProduct ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
              <BarcodeGenerator value={selectedProduct.sku} name={selectedProduct.name} />
              <div className="mt-6 w-full space-y-2">
                <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white" onClick={() => window.print()}>
                  Print Label
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setSelectedProduct(null)}>
                  Clear Selection
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
              <Barcode size={48} strokeWidth={1} className="mb-2 opacity-20" />
              <p className="text-sm">Select a product to<br/>generate a barcode label</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default InventoryManager;