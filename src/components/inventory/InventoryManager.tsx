"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Package, Plus, Search, Barcode, Edit3, Trash2, Percent, Box, AlertCircle } from 'lucide-react';
import { hasPermission } from '@/utils/permissions';
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
import { Product, Supplier } from '@/types/grocery';
import BarcodeGenerator from './BarcodeGenerator';
import { showError, showSuccess } from '@/utils/toast';
import { api } from '@/utils/api';

interface InventoryManagerProps {
  products: Product[];
  onProductChanged: () => void;
}

const InventoryManager = ({ products, onProductChanged }: InventoryManagerProps) => {
  // permissions for this section
  const canView = hasPermission('inventory', 'view');
  const canCreate = hasPermission('inventory', 'create');
  const canEdit = hasPermission('inventory', 'edit');
  const canDelete = hasPermission('inventory', 'delete');

  if (!canView) {
    return (
      <div className="p-10 text-center text-red-600 dark:text-red-400">
        You do not have permission to view inventory.
      </div>
    );
  }
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    price: 0,
    costPrice: 0,
    stockQuantity: 0,
    refillThreshold: 10,
    unit: 'pcs',
    discountPercentage: 0,
    supplierId: undefined,
    barcodeValue: ''
  });

  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    return name.includes(query) || sku.includes(query);
  });

  // load suppliers once for dropdown
  useEffect(() => {
    api.getSuppliers().then(setSuppliers).catch(err => {
      console.error('Failed to load suppliers', err);
    });
  }, []);

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
      discountPercentage: 0,
      supplierId: undefined,
      barcodeValue: ''
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsDialogOpen(true);
  };

  // keep barcode value in sync whenever related fields change
  React.useEffect(() => {
    const supplierName = suppliers.find(s => s.id === formData.supplierId)?.name || '';
    const barcodeVal = `${formData.sku || ''}|${formData.name || ''}|${formData.price || 0}|${formData.category || ''}|${supplierName}`;
    setFormData(prev => ({ ...prev, barcodeValue: barcodeVal }));
  }, [formData.sku, formData.name, formData.price, formData.category, formData.supplierId, suppliers]);

  const handleSave = async () => {
    try {
      // ensure we populate the existing `barcodeUrl` text column with our generated barcode text
      const productToSave = {
        ...formData,
        barcodeUrl: (formData.barcodeValue as string) || (formData.barcodeUrl as string) || '',
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
  
  const handleDelete = async (id: string, productForRevert?: Product) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id, productForRevert);
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <Input 
            placeholder="Search inventory..." 
            className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-100 placeholder:dark:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button onClick={openAddDialog} className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 hover:bg-primary/90 text-white rounded-xl px-6">
            <Plus className="mr-2" size={18} /> Add New Product
          </Button>
        )} 
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/80">
              <TableRow className="border-slate-200 dark:border-slate-700">
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Product</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Supplier</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Barcode</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Available Stock</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Price</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Discount</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Package size={48} className="text-slate-300 dark:text-slate-600" />
                      <div>
                        <p className="font-bold text-slate-600 dark:text-slate-300">
                          {products.length === 0 
                            ? 'No products in inventory' 
                            : 'No products match your search'}
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                          {products.length === 0 
                            ? 'Add your first product to get started' 
                            : 'Try adjusting your search query'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-800">
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{product.name || 'Unnamed Product'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku || 'N/A'} • {product.category || 'Uncategorized'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {product.supplier?.name || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">{product.sku || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge 
                          variant={product.stockQuantity <= product.refillThreshold ? "destructive" : "secondary"} 
                          className={`rounded-md w-fit font-black text-sm ${product.stockQuantity > product.refillThreshold ? 'dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600' : 'dark:bg-red-900/50 dark:text-red-200 dark:border-red-800'}`}
                        >
                          {product.stockQuantity} {product.unit || 'pcs'}
                        </Badge>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                          Refill at: {product.refillThreshold}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">LKR {product.price?.toFixed(2) || '0.00'}</span>
                        {product.discountPercentage > 0 && (
                          <span className="text-[10px] text-green-600 dark:text-green-400 font-bold">
                            Net: LKR {(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.discountPercentage > 0 ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                          {product.discountPercentage}% OFF
                        </Badge>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-500 text-xs">No discount</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                          <Barcode size={16} />
                        </Button>
                        {canEdit && (
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                            <Edit3 size={16} />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id, product)} className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Barcode className="text-primary dark:text-slate-400" size={20} /> Barcode Preview
          </h3>
          {selectedProduct ? (
              <div ref={previewRef} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50/30 dark:bg-slate-800/50">
              <BarcodeGenerator 
                value={selectedProduct.barcodeValue || selectedProduct.sku} 
                name={selectedProduct.name}
                sku={selectedProduct.sku}
                price={selectedProduct.price}
                category={selectedProduct.category}
                supplier={selectedProduct.supplier?.name}
              />
              <div className="mt-6 w-full space-y-2">
                <Button className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white" onClick={() => window.print()}>
                  Print Label
                </Button>
                <Button className="w-full bg-primary/80 text-white" onClick={async () => {
                  // generate Base64 SVG from the rendered barcode in preview and save into product.barcodeUrl
                  if (!selectedProduct.id) {
                    showError('Save the product first to persist barcode');
                    return;
                  }

                  try {
                    const container = previewRef.current;
                    if (!container) {
                      showError('Barcode preview not found');
                      return;
                    }
                    const svg = container.querySelector('svg');
                    if (!svg) {
                      showError('SVG barcode element not found in preview');
                      return;
                    }

                    const svgString = new XMLSerializer().serializeToString(svg as SVGElement);
                    const base64 = btoa(unescape(encodeURIComponent(svgString)));
                    const dataUrl = `data:image/svg+xml;base64,${base64}`;

                    const updated: Product = { ...selectedProduct, barcodeUrl: dataUrl } as Product;
                    await api.saveProduct(updated);
                    showSuccess('Barcode saved as Base64 in database');
                    onProductChanged();
                  } catch (err) {
                    console.error(err);
                    showError(err instanceof Error ? err.message : 'Failed to save barcode');
                  }
                }}>
                  Save Barcode
                </Button>
                <Button className="w-full border border-slate-300" onClick={() => {
                  // open small print window that shows only barcode + price
                  const val = selectedProduct.barcodeValue || selectedProduct.sku || '';
                  const price = selectedProduct.price != null ? `LKR ${selectedProduct.price.toFixed(2)}` : '';
                  const win = window.open('', '_blank', 'width=400,height=300');
                  if (!win) {
                    showError('Unable to open print window');
                    return;
                  }
                  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Print Barcode</title><style>body{font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px} .price{font-weight:700;margin-top:10px} </style></head><body><div id="barcode"></div><div class="price">${price}</div><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script><script>const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('id','barcodeSvg'); document.getElementById('barcode').appendChild(svg); JsBarcode('#barcodeSvg', ${JSON.stringify(val)}, {format:'CODE128',displayValue:true,width:2,height:60,margin:10}); window.onload = () => { setTimeout(()=>{ window.print(); window.onafterprint = ()=>{ window.close(); } }, 250); };</script></body></html>`;
                  win.document.open();
                  win.document.write(html);
                  win.document.close();
                }}>
                  Print Barcode Only
                </Button>
                <Button variant="outline" className="w-full dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" onClick={() => setSelectedProduct(null)}>
                  Clear Selection
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center">
              <Barcode size={48} strokeWidth={1} className="mb-2 opacity-20" />
              <p className="text-sm">Select a product to<br/>generate a barcode label</p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Product Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Fresh Apples" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">SKU / Barcode</Label>
                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="GR-001" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Barcode Text</Label>
                <Input value={formData.barcodeValue || ''} readOnly className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Category</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Fruits" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Unit (kg, pcs, etc.)</Label>
                <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="pcs" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Supplier</Label>
              <select
                value={formData.supplierId || ''}
                onChange={e => setFormData({...formData, supplierId: e.target.value || undefined})}
                className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              >
                <option value="">-- none --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Cost Price (LKR)</Label>
                <Input type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Selling Price (LKR)</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-green-600 dark:text-green-400"><Percent size={14} /> Discount (%)</Label>
                <Input type="number" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: parseFloat(e.target.value) || 0})} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-primary dark:text-slate-300"><Box size={16} /> Current Stock</Label>
                <Input type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-orange-600 dark:text-orange-400"><AlertCircle size={16} /> Refill Threshold</Label>
                <Input type="number" value={formData.refillThreshold} onChange={e => setFormData({...formData, refillThreshold: parseInt(e.target.value) || 0})} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</Button>
            <Button
            onClick={handleSave}
            disabled={editingProduct ? !canEdit : !canCreate}
            className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {editingProduct ? 'Update Product' : 'Add to Inventory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManager;