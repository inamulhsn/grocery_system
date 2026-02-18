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
  DialogFooter
} from "@/components/ui/dialog";
import { Product } from '@/types/grocery';
import BarcodeGenerator from './BarcodeGenerator';
import { showError, showSuccess } from '@/utils/toast';
import { api } from '@/utils/api';

interface InventoryManagerProps {
  products: Product[];
  onProductChanged: () => void;
}

const InventoryManager = ({ products, onProductChanged }: InventoryManagerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    price: 0,
    costPrice: 0,
    stockQuantity: 0,
    refillThreshold: 10,
    unit: 'pcs',
    discountPercentage: 0
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
      costPrice: 0,
      stockQuantity: 0,
      refillThreshold: 10,
      unit: 'pcs',
      discountPercentage: 0
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const productToSave = {
        ...formData,
        id: editingProduct ? editingProduct.id : undefined,
      } as Product;

      await api.saveProduct(productToSave);
      
      showSuccess(editingProduct ? "Product updated" : "Product created");
      setIsDialogOpen(false);
      onProductChanged();
    } catch (e) {
      showError("Failed to save product");
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        showSuccess("Product deleted");
        onProductChanged();
      } catch (e) {
        showError("Failed to delete product");
      }
    }
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
                        variant={product.stockQuantity <= product.refillThreshold ? "destructive" : "secondary"} 
                        className="rounded-md w-fit font-black text-sm"
                      >
                        {product.stockQuantity} {product.unit}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Refill at: {product.refillThreshold}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">LKR {product.price.toFixed(2)}</span>
                      {product.discountPercentage > 0 && (
                        <span className="text-[10px] text-green-600 font-bold">
                          Net: LKR {(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.discountPercentage > 0 ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {product.discountPercentage}% OFF
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
                <Label>Cost Price (LKR)</Label>
                <Input type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Selling Price (LKR)</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-green-600"><Percent size={14} /> Discount (%)</Label>
                <Input type="number" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: parseFloat(e.target.value) || 0})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-primary"><Box size={16} /> Current Stock</Label>
                <Input 
                  type="number" 
                  value={formData.stockQuantity} 
                  onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-orange-600"><AlertCircle size={16} /> Refill Threshold</Label>
                <Input 
                  type="number" 
                  value={formData.refillThreshold} 
                  onChange={e => setFormData({...formData, refillThreshold: parseInt(e.target.value) || 0})} 
                />
              </div>
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