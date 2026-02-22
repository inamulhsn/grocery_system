"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, CreditCard, Banknote, ReceiptText, Percent, Printer, User, Phone, Loader2 } from 'lucide-react';
import { hasPermission } from '@/utils/permissions';
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
  const canCreateSale = hasPermission('pos','create');

  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customItem, setCustomItem] = useState({ name: '', unitPrice: '', quantity: '1' });

  // when a barcode is scanned it may contain encoded fields separated by |, we use sku
  const tryParseBarcode = (input: string) => {
    if (!input.includes('|')) return null;
    const parts = input.split('|');
    const sku = parts[0];
    const details = parts.slice(1).join(' | '); // for toast display
    return { sku, details };
  };
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
    // if item is manually added (no sku) we skip stock validation
    const isManual = !product.sku;
    if (!isManual && product.stockQuantity <= 0) {
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
  // sum of manually added items (no sku or synthetic manual- id)
  const manualGross = Math.round(cart
    .filter(i => !i.sku || i.id.startsWith('manual-'))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100) / 100;

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
    // open a new window with a white-styled receipt and trigger print there
    if (!lastCompletedSale) {
      showError('No sale to print');
      return;
    }

    const sale = lastCompletedSale;
    const itemsHtml = sale.items.map(i => `
      <tr>
        <td style="padding:8px 0;font-weight:700">${escapeHtml(i.productName)}</td>
        <td style="text-align:center">${i.quantity}</td>
        <td style="text-align:right;font-weight:700">LKR ${i.totalPrice.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="font-size:11px;color:#64748b">@ LKR ${i.unitPrice.toFixed(2)}</td>
        <td></td>
        <td></td>
      </tr>
    `).join('');

    const dateStr = new Date(sale.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
    const customerName = sale.customerName?.trim() || 'Customer';
    const total = sale.totalAmount.toFixed(2);
    const cashRec = sale.paymentMethod === 'cash' && cashReceived ? Number(cashReceived).toFixed(2) : '';
    const bal = sale.paymentMethod === 'cash' && balance ? Number(balance).toFixed(2) : '';

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;background:#fff;padding:20px}
        .receipt{max-width:360px;margin:0 auto}
        .center{text-align:center}
        table{width:100%;border-collapse:collapse}
        .muted{color:#64748b;font-size:12px}
        .total{font-weight:800;font-size:18px}
      </style>
    </head><body><div class="receipt">
      <div class="center">
        ${branding.logoUrl ? `<img src="${branding.logoUrl}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;margin-bottom:6px"/>` : ''}
        <div style="font-weight:900;font-size:18px">${escapeHtml(branding.systemName || 'GroceryPro')}</div>
        <div class="muted">Official Transaction Receipt</div>
        <div style="margin:10px 0;border-top:1px dashed #e6edf3;padding-top:8px;font-size:12px" class="muted">
          <div>${dateStr}</div>
          <div>Order ID: ${escapeHtml(sale.id)}</div>
          <div>Customer: ${escapeHtml(customerName)}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr style="color:#64748b;font-size:12px;text-transform:uppercase">
            <th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div style="border-top:1px solid #e6edf3;margin-top:12px;padding-top:12px">
        <div style="display:flex;justify-content:space-between;font-size:13px"><span>Subtotal</span><span>LKR ${total}</span></div>
        <div style="display:flex;justify-content:space-between;margin-top:8px" class="total"><span>TOTAL</span><span>LKR ${total}</span></div>
        ${sale.paymentMethod === 'cash' ? `<div style="margin-top:8px;font-size:12px">
          <div style="display:flex;justify-content:space-between"><span>Cash Received</span><span>LKR ${cashRec}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700"><span>Balance</span><span>LKR ${bal}</span></div>
        </div>` : ''}
        <div style="margin-top:12px;font-size:11px;color:#64748b">Payment Method: <strong>${escapeHtml(sale.paymentMethod)}</strong></div>
      </div>
      <div class="center" style="margin-top:14px;font-weight:700">THANK YOU FOR SHOPPING!</div>
    </div>
    <script>window.onload = function(){ setTimeout(function(){ window.print(); window.onafterprint = function(){ window.close(); } },200); };</script></body></html>`;

    const win = window.open('', '_blank', 'width=420,height=700');
    if (!win) {
      showError('Unable to open print window');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    setShowPrintPrompt(false);
    showSuccess('Sending bill to printer');
  };

  // simple HTML escape to avoid injection in generated print window
  const escapeHtml = (str: any) => {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
        {!canCreateSale && (
          <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-center">
            You have view-only access to POS; you cannot complete sales.
          </div>
        )}
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
          <Input 
            className="pl-10 h-14 text-lg rounded-2xl border-2 border-primary/10 dark:border-slate-700 focus:border-primary dark:bg-slate-800 dark:text-slate-100 placeholder:dark:text-slate-500 transition-all shadow-sm"
            placeholder="Search by name or scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // first try parsing as barcode string (sku|...)
                const parsed = tryParseBarcode(searchQuery);
                if (parsed) {
                  const prod = products.find(p => p.sku === parsed.sku);
                  if (prod) {
                    addToCart(prod);
                    showSuccess(`Scanned: ${parsed.details}`);
                  } else {
                    showError('Product not found');
                  }
                } else if (searchQuery.trim()) {
                  // user typed something manually; try to resolve by sku or name
                  const manual = searchQuery.trim().toLowerCase();
                  // look for exact sku match first
                  let prod = products.find(p => p.sku.toLowerCase() === manual);
                  if (!prod) {
                    // fall back to name prefix match
                    prod = products.find(p => p.name.toLowerCase().includes(manual));
                  }
                  if (prod) {
                    addToCart(prod);
                    showSuccess(`Added ${prod.name}`);
                  } else {
                    showError('Product not found');
                  }
                }
                setSearchQuery('');
                e.preventDefault();
              }
            }}
            autoFocus
          />
          <Button
            variant="outline"
            size="sm"
            className="ml-2 h-10"
            onClick={() => setShowCustomDialog(true)}
          >
            + Item
          </Button>
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
                disabled={cart.length === 0 || !canCreateSale}
              >
                <Banknote size={20} />
                <span className="text-[10px] uppercase font-bold">Cash</span>
              </Button>
              <Button 
                className="h-16 flex-col gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                onClick={() => handleCheckout('card')}
                disabled={cart.length === 0 || !canCreateSale}
              >
                <CreditCard size={20} />
                <span className="text-[10px] uppercase font-bold">Card</span>
              </Button>
              <Button 
                className="h-16 flex-col gap-1 rounded-xl bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
                onClick={() => handleCheckout('upi')}
                disabled={cart.length === 0 || !canCreateSale}
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

      {/* Custom item dialog for manual entries */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="sm:max-w-[400px] max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-slate-100">Add custom item</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Enter description, price and quantity for a product not in inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="custom-name" className="text-sm font-bold text-slate-600 dark:text-slate-300">Name</Label>
              <Input
                id="custom-name"
                value={customItem.name}
                onChange={(e) => setCustomItem(c => ({ ...c, name: e.target.value }))}
                className="h-10 rounded-lg dark:bg-slate-900 dark:border-slate-700"
                placeholder="Item description"
              />
            </div>
            <div>
              <Label htmlFor="custom-price" className="text-sm font-bold text-slate-600 dark:text-slate-300">Unit Price</Label>
              <Input
                id="custom-price"
                type="number"
                value={customItem.unitPrice}
                onChange={(e) => setCustomItem(c => ({ ...c, unitPrice: e.target.value }))}
                className="h-10 rounded-lg dark:bg-slate-900 dark:border-slate-700"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="custom-qty" className="text-sm font-bold text-slate-600 dark:text-slate-300">Quantity</Label>
              <Input
                id="custom-qty"
                type="number"
                min="1"
                value={customItem.quantity}
                onChange={(e) => setCustomItem(c => ({ ...c, quantity: e.target.value }))}
                className="h-10 rounded-lg dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowCustomDialog(false)} className="rounded-xl dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</Button>
            <Button
              onClick={() => {
                const name = customItem.name.trim();
                const price = parseFloat(customItem.unitPrice);
                const qty = parseInt(customItem.quantity);
                if (!name) {
                  showError('Name is required');
                  return;
                }
                if (isNaN(price) || price <= 0) {
                  showError('Enter a valid price');
                  return;
                }
                if (isNaN(qty) || qty < 1) {
                  showError('Enter a valid quantity');
                  return;
                }
                const manualProd: Product = {
                  id: `manual-${Date.now()}`,
                  sku: '',
                  name,
                  category: '',
                  price,
                  costPrice: price,
                  stockQuantity: 0,
                  refillThreshold: 0,
                  unit: '',
                  discountPercentage: 0,
                  barcodeUrl: undefined,
                };
                const discountAmount = 0;
                const finalPrice = price;
                setCart(prev => [...prev, { ...manualProd, quantity: qty, finalPrice, discountAmount }]);
                setShowCustomDialog(false);
                setCustomItem({ name: '', unitPrice: '', quantity: '1' });
                showSuccess(`Added ${name}`);
              }}
              className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl px-6 font-bold"
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Bill Prompt */}
      <Dialog open={showPrintPrompt} onOpenChange={setShowPrintPrompt}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto dark:border-slate-800" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
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