"use client";

import React, { useState } from 'react';
import { Search, ShoppingCart, CreditCard, Banknote, ReceiptText, Percent } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CartItem from './CartItem';
import { Product, Sale, SaleItem } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';

interface POSInterfaceProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
}

const POSInterface = ({ products, onCompleteSale }: POSInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      showError("Product out of stock!");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          showError("Cannot add more than available stock!");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      
      // Calculate discounted price
      const discountAmount = (product.price * (product.discount_percentage || 0)) / 100;
      const finalPrice = product.price - discountAmount;
      
      return [...prev, { ...product, quantity: 1, finalPrice, discountAmount }];
    });
    setSearchQuery('');
  };

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (product && newQty > product.stock_quantity) {
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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.discountAmount * item.quantity), 0);
  const total = subtotal - totalDiscount;

  const handleCheckout = (method: 'cash' | 'card' | 'upi') => {
    const saleItems: SaleItem[] = cart.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      discount_amount: item.discountAmount * item.quantity,
      total_price: (item.price - item.discountAmount) * item.quantity
    }));

    const newSale: Sale = {
      id: `SALE-${Date.now()}`,
      created_at: new Date().toISOString(),
      total_amount: total,
      payment_method: method,
      cashier_id: 'admin',
      items: saleItems
    };

    onCompleteSale(newSale);
    showSuccess(`Sale completed via ${method.toUpperCase()}!`);
    setCart([]);
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
          {filteredProducts.map(product => (
            <Card 
              key={product.id}
              className={`p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group relative overflow-hidden ${product.stock_quantity <= 0 ? 'opacity-50 grayscale' : ''}`}
              onClick={() => addToCart(product)}
            >
              {product.discount_percentage > 0 && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg flex items-center gap-1">
                  <Percent size={10} /> {product.discount_percentage}% OFF
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
                      ${(product.price * (1 - (product.discount_percentage || 0) / 100)).toFixed(2)}
                    </span>
                    {product.discount_percentage > 0 && (
                      <span className="text-xs text-slate-400 line-through">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.stock_quantity < 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {product.stock_quantity} {product.unit} left
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
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
                  {item.discount_percentage > 0 && (
                    <p className="text-[10px] text-green-600 font-bold px-3 -mt-1">
                      Applied {item.discount_percentage}% discount (-${(item.discountAmount * item.quantity).toFixed(2)})
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-white border-t space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Total Discount</span>
                  <span>-${totalDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-2xl font-black pt-2 border-t border-slate-50">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
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
    </div>
  );
};

export default POSInterface;