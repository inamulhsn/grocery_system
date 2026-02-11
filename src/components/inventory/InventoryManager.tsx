"use client";

import React, { useState } from 'react';
import { Package, Plus, Search, Barcode, Edit3, Trash2, Percent, Box, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Product } from '@/types/grocery';
import BarcodeGenerator from './BarcodeGenerator';
import { showSuccess } from '@/utils/toast';

interface InventoryManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const InventoryManager = ({ products, onUpdateProducts }: InventoryManagerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    price: 0,
    cost_price: 0,
    stock_quantity: 0,
    refill_threshold: 10,
    unit: 'pcs',
    discount_percentage: 0
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `GR-${Math.floor(100 + Math.random() * 900)}`,
      category: '',
      price: 0,
      cost_price: 0,
      stock_quantity: 0,
      refill_threshold: 10,
      unit: 'pcs',
      discount_percentage: 0
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingProduct) {
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...p, ...formData } as Product : p
      );
      onUpdateProducts(updatedProducts);
      showSuccess("Product updated successfully");
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...formData,
      } as Product;
      onUpdateProducts([...products, newProduct]);
      showSuccess("New product added to inventory");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
    showSuccess("Product removed from inventory");
  };

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
        <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6">
          <Plus className="mr-2" size={18} /> Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden border-slate-200 shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Product</TableHead>
                <TableHead className="font-bold">Available Stock</TableHead>
                <TableHead className="font-bold">Price</TableHead>
                <TableHead className="font-bold">Discount</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-bold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sku} • {product.category}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={product.stock_quantity <= product.refill_threshold ? "destructive" : "secondary"} 
                        className="rounded-md w-fit font-black text-sm"
                      >
                        {product.stock_quantity} {product.unit}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Refill at: {product.refill_threshold}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                      {product.discount_percentage > 0 && (
                        <span className="text-[10px] text-green-600 font-bold">
                          Net: ${(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.discount_percentage > 0 ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {product.discount_percentage}% OFF
                      </Badge>
                    ) : (
                      <span className="text-slate-300 text-xs">No discount</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)}>
                        <Barcode size={16} className="text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                        <Edit3 size={16} className="text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 size={16} className="text-red-400" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Fresh Apples" />
              </div>
              <div className="space-y-2">
                <Label>SKU / Barcode</Label>
                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="GR-001" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Fruits" />
              </div>
              <div className="space-y-2">
                <Label>Unit (kg, pcs, etc.)</Label>
                <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="pcs" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cost Price ($)</Label>
                <Input type="number" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Selling Price ($)</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-green-600"><Percent size={14} /> Discount (%)</Label>
                <Input type="number" value={formData.discount_percentage} onChange={e => setFormData({...formData, discount_percentage: parseFloat(e.target.value)})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-primary"><Box size={16} /> Current Stock</Label>
                <Input 
                  type="number" 
                  value={formData.stock_quantity} 
                  onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-orange-600"><AlertCircle size={16} /> Refill Threshold</Label>
                <Input 
                  type="number" 
                  value={formData.refill_threshold} 
                  onChange={e => setFormData({...formData, refill_threshold: parseInt(e.target.value)})} 
                />
              </div>
              <p className="col-span-2 text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-wider">
                Product will show in "Refill" list when stock drops to or below the threshold.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-primary text-white">
              {editingProduct ? 'Update Product' : 'Add to Inventory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManager;