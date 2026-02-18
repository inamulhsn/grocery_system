"use client";

import React from 'react';
import { Receipt, Calendar, Clock, CreditCard, Banknote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sale } from '@/types/grocery';

interface SalesHistoryProps {
  sales: Sale[];
}

const SalesHistory = ({ sales }: SalesHistoryProps) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
        <Receipt size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Sales Recorded</h2>
        <p className="text-slate-500">Complete a transaction in the POS to see records here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-800">Daily Sales Records</h2>
        <Badge variant="secondary" className="px-3 py-1">Total: {sales.length} Transactions</Badge>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {sales.map((sale) => (
          <AccordionItem key={sale.id} value={sale.id} className="border-none">
            <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex flex-1 items-center justify-between text-left">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      sale.paymentMethod === 'cash' ? 'bg-green-50 text-green-600' : 
                      sale.paymentMethod === 'card' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {sale.paymentMethod === 'cash' ? <Banknote size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Order #{sale.id.slice(-4)}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> 
                          {sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString() : 'N/A'}
                        </span>
                        <span className="capitalize">• {sale.paymentMethod || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mr-4 text-right">
                    <p className="text-lg font-black text-primary">
                      LKR {(sale.totalAmount || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {(sale.items?.length || 0)} Items
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="border-t border-slate-100 mt-2 pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 font-medium border-b border-slate-50">
                        <th className="text-left pb-2">Item Name</th>
                        <th className="text-center pb-2">Qty</th>
                        <th className="text-right pb-2">Price</th>
                        <th className="text-right pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sale.items?.map((item, idx) => (
                        <tr key={idx} className="text-slate-600">
                          <td className="py-2 font-medium">{item.productName}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-right">LKR {(item.unitPrice || 0).toFixed(2)}</td>
                          <td className="py-2 text-right font-bold text-slate-800">
                            LKR {(item.totalPrice || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SalesHistory;