"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, CreditCard, Banknote, ReceiptText, Percent, Printer, User, Phone, Loader2 } from 'lucide-react';
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
import Receipt from './Receipt';
import { Product, Sale, SaleItem, SystemSettings, Customer } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';
import { api } from '@/utils/api';

interface POSInterfaceProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => Promise<void>;
}

type CartLine = Product & { quantity: number; finalPrice: number; discountAmount: number };

const POSInterface = ({ products, onCompleteSale }: POSInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [branding, setBranding] = useState<SystemSettings>({ systemName: 'GroceryPro', logoUrl: '' });
  
  // Checkout dialog: used for all payment methods (cash/card/upi)
  const [checkoutMethod, setCheckoutMethod] = useState<'cash' | 'card' | 'upi' | null>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  // Customer at checkout
  const [customerMobile, setCustomerMobile] = useState('');
  const [lookedUpCustomer, setLookedUpCustomer] = useState<Customer | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', email: '', address: '', mobile: '' });
  const [addingCustomer, setAddingCustomer] = useState(false);

  useEffect(() => {
    api.getBranding().then(data => {
      if (data) setBranding(data);
    });
  }, []);

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

  const openCheckoutDialog = (method: 'cash' | 'card' | 'upi') => {
    setCheckoutMethod(method);
    setCashReceived('');
    setCustomerMobile('');
    setLookedUpCustomer(null);
    setShowAddCustomerForm(false);
    setNewCustomerForm({ name: '', email: '', address: '', mobile: '' });
  };

  const closeCheckoutDialog = () => {
    setCheckoutMethod(null);
    setLookedUpCustomer(null);
    setShowAddCustomerForm(false);
  };

  const handleCheckout = (method: 'cash' | 'card' | 'upi') => {
    openCheckoutDialog(method);
  };

  const lookupCustomerByPhone = async () => {
    const phone = customerMobile.trim();
    if (!phone) return;
    setLookupLoading(true);
    setLookedUpCustomer(null);
    try {
      const customer = await api.getCustomerByPhone(phone);
      if (customer) {
        setLookedUpCustomer(customer);
        setShowAddCustomerForm(false);
        showSuccess(`Found customer: ${customer.name}`);
      } else {
        setShowAddCustomerForm(true);
        setNewCustomerForm(prev => ({ ...prev, mobile: phone }));
      }
    } catch (error: unknown) {
      console.error('Customer lookup error:', error);
      showError(error instanceof Error ? error.message : 'Failed to lookup customer');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAddNewCustomer = async () => {
    const { name, mobile } = newCustomerForm;
    if (!name.trim() || !mobile.trim()) {
      showError('Name and mobile number are required.');
      return;
    }
    setAddingCustomer(true);
    try {
      const created = await api.createCustomer({
        name: name.trim(),
        email: newCustomerForm.email.trim() || '',
        address: newCustomerForm.address.trim() || '',
        mobileNumber: mobile.trim(),
        whatsAppNumber: mobile.trim()
      });
      setLookedUpCustomer(created);
      setShowAddCustomerForm(false);
      setNewCustomerForm({ name: '', email: '', address: '', mobile: '' });
      showSuccess('Customer added.');
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Failed to add customer.');
    } finally {
      setAddingCustomer(false);
    }
  };

  const skipCustomer = () => {
    setLookedUpCustomer(null);
    setShowAddCustomerForm(false);
    setCustomerMobile('');
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

    const customerId = lookedUpCustomer?.id;
    const customerName = lookedUpCustomer?.name?.trim() || '';
    const customerPhone = (lookedUpCustomer?.mobileNumber || customerMobile || '').trim();

    const newSale: Sale = {
      id: `SALE-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalAmount: total,
      paymentMethod: method,
      cashierId: 'admin',
      items: saleItems,
      ...(customerId && { customerId }),
      ...(customerName && { customerName }),
      ...(customerPhone && { customerPhone })
    };

    try {
      await onCompleteSale(newSale);
      setLastCompletedSale(newSale);
      setCart([]);
      closeCheckoutDialog();
      setShowPrintPrompt(true);
    } catch (error: unknown) {
      console.error('Sale completion failed:', error);
      showError(error instanceof Error ? error.message : 'Failed to complete sale.');
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
          <Input 
            className="pl-10 h-14 text-lg rounded-2xl border-2 border-primary/10 dark:border-slate-700 focus:border-primary dark:bg-slate-800 dark:text-slate-100 placeholder:dark:text-slate-500 transition-all shadow-sm"
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
                className={`p-4 cursor-pointer hover:border-primary dark:hover:border-slate-600 hover:shadow-md transition-all group relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                onClick={() => addToCart(product)}
              >
                {product.discountPercentage > 0 && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg flex items-center gap-1">
                    <Percent size={10} /> {product.discountPercentage}% OFF
                  </div>
                )}
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary/60 dark:text-slate-400 uppercase tracking-wider">{product.category}</span>
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-slate-300 transition-colors">{product.name}</h3>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-gray-900 dark:text-slate-100">
                        LKR {discountedPrice.toFixed(2)}
                      </span>
                      {product.discountPercentage > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 line-through">LKR {product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={isLowStock ? "destructive" : "secondary"} 
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isLowStock ? 'animate-pulse dark:bg-red-900/50 dark:text-red-200' : 'dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600'}`}
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
        <Card className="flex-1 flex flex-col overflow-hidden rounded-2xl border-none shadow-xl bg-gray-50/50 dark:bg-slate-900 dark:border dark:border-slate-800">
          <div className="p-4 bg-white dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-primary dark:text-slate-300" size={20} />
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Current Order</h2>
            </div>
            <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">{cart.length} Items</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-2">
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

          <div className="p-6 bg-white dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>LKR {subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                  <span>Total Discount</span>
                  <span>-LKR {totalDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-2xl font-black pt-2 border-t border-slate-50 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <span>Total</span>
              <span className="text-primary dark:text-slate-200">LKR {total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <Button 
                className="h-16 flex-col gap-1 rounded-xl bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                onClick={() => handleCheckout('cash')}
                disabled={cart.length === 0}
              >
                <Banknote size={20} />
                <span className="text-[10px] uppercase font-bold">Cash</span>
              </Button>
              <Button 
                className="h-16 flex-col gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                onClick={() => handleCheckout('card')}
                disabled={cart.length === 0}
              >
                <CreditCard size={20} />
                <span className="text-[10px] uppercase font-bold">Card</span>
              </Button>
              <Button 
                className="h-16 flex-col gap-1 rounded-xl bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
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

      {/* Checkout Dialog (all payment methods) – customer lookup & cash amount */}
      <Dialog open={checkoutMethod !== null} onOpenChange={(open) => !open && closeCheckoutDialog()}>
        <DialogContent className="sm:max-w-[440px] dark:bg-slate-900 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Checkout — {checkoutMethod === 'cash' ? 'Cash' : checkoutMethod === 'card' ? 'Card' : 'UPI'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {checkoutMethod === 'cash' ? 'Enter amount received and optionally link a customer.' : 'Optionally link a customer to this sale.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-slate-500 dark:text-slate-400">Total Payable</span>
              <span className="text-2xl font-black text-primary dark:text-slate-200">LKR {total.toFixed(2)}</span>
            </div>

            {checkoutMethod === 'cash' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cash-received" className="text-sm font-bold text-slate-600 dark:text-slate-300">Cash Received</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-500">LKR</span>
                    <Input
                      id="cash-received"
                      type="number"
                      className="pl-12 h-12 text-lg font-bold rounded-xl border-2 focus:border-primary dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                      placeholder="0.00"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                    />
                  </div>
                </div>
                {parseFloat(cashReceived) >= total && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 flex justify-between items-center">
                    <span className="font-bold text-green-700 dark:text-green-300 text-sm">Balance to Return</span>
                    <span className="text-xl font-black text-green-700 dark:text-green-300">LKR {balance.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                <User size={16} /> Customer (optional)
              </div>
              {lookedUpCustomer ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{lookedUpCustomer.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone size={10} /> {lookedUpCustomer.mobileNumber || lookedUpCustomer.whatsAppNumber}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Existing customer — details are read-only</p>
                  <Button type="button" variant="ghost" size="sm" className="mt-1 h-8 text-xs" onClick={skipCustomer}>Change / Remove</Button>
                </div>
              ) : showAddCustomerForm ? (
                <div className="space-y-2 p-3 bg-amber-50/50 dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400">No customer found. Add new or skip.</p>
                  <Input placeholder="Name *" value={newCustomerForm.name} onChange={(e) => setNewCustomerForm(f => ({ ...f, name: e.target.value }))} className="h-10 rounded-lg dark:bg-slate-900 dark:border-slate-600" />
                  <Input placeholder="Mobile *" value={newCustomerForm.mobile} onChange={(e) => setNewCustomerForm(f => ({ ...f, mobile: e.target.value }))} className="h-10 rounded-lg dark:bg-slate-900 dark:border-slate-600" />
                  <Input placeholder="Email" value={newCustomerForm.email} onChange={(e) => setNewCustomerForm(f => ({ ...f, email: e.target.value }))} className="h-10 rounded-lg dark:bg-slate-900 dark:border-slate-600" />
                  <Input placeholder="Address" value={newCustomerForm.address} onChange={(e) => setNewCustomerForm(f => ({ ...f, address: e.target.value }))} className="h-10 rounded-lg dark:bg-slate-900 dark:border-slate-600" />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => { setShowAddCustomerForm(false); setNewCustomerForm({ name: '', email: '', address: '', mobile: customerMobile }); }} className="rounded-lg">Skip</Button>
                    <Button type="button" size="sm" onClick={handleAddNewCustomer} disabled={addingCustomer || !newCustomerForm.name.trim() || !newCustomerForm.mobile.trim()} className="rounded-lg">
                      {addingCustomer ? <Loader2 size={14} className="animate-spin" /> : 'Add & Use'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                    <Input
                      placeholder="Mobile number"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && lookupCustomerByPhone()}
                      className="pl-9 h-10 rounded-lg dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <Button type="button" onClick={lookupCustomerByPhone} disabled={lookupLoading || !customerMobile.trim()} className="rounded-lg shrink-0">
                    {lookupLoading ? <Loader2 size={18} className="animate-spin" /> : 'Look up'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={closeCheckoutDialog} className="rounded-xl dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</Button>
            <Button
              onClick={() => checkoutMethod && completeTransaction(checkoutMethod)}
              className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl px-8 font-bold"
              disabled={checkoutMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < total)}
            >
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Bill Prompt */}
      <Dialog open={showPrintPrompt} onOpenChange={setShowPrintPrompt}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center text-slate-900 dark:text-slate-100">Transaction Successful</DialogTitle>
          </DialogHeader>
          
          {lastCompletedSale && (
            <div className="py-4">
              <Receipt 
                sale={lastCompletedSale} 
                branding={branding} 
                cashReceived={lastCompletedSale.paymentMethod === 'cash' ? parseFloat(cashReceived) : undefined} 
                balance={lastCompletedSale.paymentMethod === 'cash' ? balance : undefined} 
              />
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowPrintPrompt(false)} className="flex-1 rounded-xl dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Close</Button>
            <Button onClick={handlePrint} className="flex-1 bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold gap-2">
              <Printer size={18} /> Print Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSInterface;