"use client";

import React, { useState } from 'react';
import { Search, ShoppingCart, CreditCard, Banknote, ReceiptText, Percent, AlertTriangle, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import CartItem from './CartItem';
import { Product, Sale, SaleItem } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';

interface POSInterfaceProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => Promise<void>;
}

const POSInterface = ({ products, onCompleteSale }: POSInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  
  // Cash Payment Dialog State
  const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      showError("Product out of stock!");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          showError("Cannot add more than available stock!");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      
      const discountAmount = Math.round((product.price * (product.discountPercentage || 0) / 100) * 100) / 100;
      const finalPrice = Math.round((product.price - discountAmount) * 100) / 100;
      
      return [...prev, { ...product, quantity: 1, finalPrice, discountAmount }];
    });
    setSearchQuery('');
  };

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (product && newQty > product.stockQuantity) {
          showError("Insufficient stock!");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = Math.round(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100) / 100;
  const totalDiscount = Math.round(cart.reduce((sum, item) => sum + (item.discountAmount * item.quantity), 0) * 100) / 100;
  const total = Math.round((subtotal - totalDiscount) * 100) / 100;

  const balance = cashReceived ? Math.max(0, parseFloat(cashReceived) - total) : 0;

  const handleCheckout = async (method: 'cash' | 'card' | 'upi') => {
    if (method === 'cash') {
      setIsCashDialogOpen(true);
      setCashReceived('');
      return;
    }
    
    await completeTransaction(method);
  };

  const completeTransaction = async (method: 'cash' | 'card' | 'upi') => {
    const saleItems: SaleItem[] = cart.map(item => {
      const itemTotal = Math.round((item.finalPrice * item.quantity) * 100) / 100;
      const itemDiscountTotal = Math.round((item.discountAmount * item.quantity) * 100) / 100;
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.finalPrice,
        discountAmount: itemDiscountTotal,
        totalPrice: itemTotal
      };
    });

    const newSale: Sale = {
      id: `SALE-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalAmount: total,
      paymentMethod: method,
      cashierId: 'admin',
      items: saleItems
    };

    try {
      await onCompleteSale(newSale);
      setLastCompletedSale(newSale);
      setCart([]);
      setIsCashDialogOpen(false);
      setShowPrintPrompt(true);
    } catch (error: any) {
      console.error('Sale completion failed:', error);
      showError(error?.message || 'Failed to complete sale.');
    }
  };

  const handlePrint = () => {
    window.print();
    setShowPrintPrompt(false);
    showSuccess("Bill sent to printer!");
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input 
            className="pl-10 h-14 text-lg rounded-2xl border-2 border-primary/10 focus:border-primary transition-all shadow-sm"
            placeholder="Search by name or scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2">
          {filteredProducts.map(product => {
            const isLowStock = product.stockQuantity <= product.refillThreshold;
            const isOutOfStock = product.stockQuantity <= 0;
            const discountedPrice = Math.round((product.price * (1 - (product.discountPercentage || 0) / 100)) * 100) / 100;

            return (
              <Card 
                key={product.id}
                className={`p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group relative overflow-hidden ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                onClick={() => addToCart(product)}
              >
                {product.discountPercentage > 0 && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg flex items-center gap-1">
                    <Percent size={10} /> {product.discountPercentage}% OFF
                  </div>
                )}
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">{product.category}</span>
                    <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{product.name}</h3>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-gray-900">
                        LKR {discountedPrice.toFixed(2)}
                      </span>
                      {product.discountPercentage > 0 && (
                        <span className="text-xs text-slate-400 line-through">LKR {product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={isLowStock ? "destructive" : "secondary"} 
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isLowStock ? 'animate-pulse' : ''}`}
                        >
                          {product.stockQuantity} {product.unit} left
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col overflow-hidden rounded-2xl border-none shadow-xl bg-gray-50/50">
          <div className="p-4 bg-white border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-primary" size={20} />
              <h2 className="font-bold text-lg">Current Order</h2>
            </div>
            <Badge variant="secondary">{cart.length} Items</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <ReceiptText size={48} strokeWidth={1} />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="mb-2">
                  <CartItem 
                    item={{...item, price: item.finalPrice}} 
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-white border-t space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>LKR {subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Total Discount</span>
                  <span>-LKR {totalDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-2xl font-black pt-2 border-t border-slate-50">
              <span>Total</span>
              <span className="text-primary">LKR {total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <Button 
                className="h-16 flex-col gap-1 rounded-xl bg-green-600 hover:bg-green-700"
                onClick={() => handleCheckout('cash')}
                disabled={cart.length === 0}
              >
                <Banknote size={20} />
                <span className="text-[10px] uppercase font-bold">Cash</span>
              </Button>
              <Button 
                className="h-16 flex-col gap-1 rounded-xl bg-blue-600 hover:bg-blue-700"
                onClick={() => handleCheckout('card')}
                disabled={cart.length === 0}
              >
                <CreditCard size={20} />
                <span className="text-[10px] uppercase font-bold">Card</span>
              </Button>
              <Button 
                className="h-16 flex-col gap-1 rounded-xl bg-purple-600 hover:bg-purple-700"
                onClick={() => handleCheckout('upi')}
                disabled={cart.length === 0}
              >
                <div className="font-black italic text-sm">UPI</div>
                <span className="text-[10px] uppercase font-bold">Digital</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Cash Payment Dialog */}
      <Dialog open={isCashDialogOpen} onOpenChange={setIsCashDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Cash Payment</DialogTitle>
            <DialogDescription>Enter the amount received from the customer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-500">Total Payable</span>
              <span className="text-2xl font-black text-primary">LKR {total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cash-received" className="text-sm font-bold text-slate-600">Cash Received</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">LKR</span>
                <Input 
                  id="cash-received"
                  type="number"
                  className="pl-12 h-14 text-xl font-bold rounded-xl border-2 focus:border-primary"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {parseFloat(cashReceived) >= total && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <span className="font-bold text-green-700">Balance to Return</span>
                <span className="text-2xl font-black text-green-700">LKR {balance.toFixed(2)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCashDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
              onClick={() => completeTransaction('cash')} 
              className="bg-primary text-white rounded-xl px-8 font-bold"
              disabled={!cashReceived || parseFloat(cashReceived) < total}
            >
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Bill Prompt */}
      <Dialog open={showPrintPrompt} onOpenChange={setShowPrintPrompt}>
        <DialogContent className="sm:max-w-[400px] text-center">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <ReceiptText size={32} />
            </div>
            <DialogTitle className="text-2xl font-black">Sale Completed!</DialogTitle>
            <DialogDescription>The transaction has been recorded successfully.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-500">Would you like to print the receipt for this order?</p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPrintPrompt(false)} className="flex-1 rounded-xl">No, Skip</Button>
            <Button onClick={handlePrint} className="flex-1 bg-primary text-white rounded-xl font-bold gap-2">
              <Printer size={18} /> Print Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSInterface;