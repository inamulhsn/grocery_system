"use client";

import React from 'react';
import { Product, Sale, SystemSettings } from '@/types/grocery';

interface ReceiptProps {
  sale: Sale;
  branding: SystemSettings;
  cashReceived?: number;
  balance?: number;
}

const Receipt = ({ sale, branding, cashReceived, balance }: ReceiptProps) => {
  const dateStr = new Date(sale.createdAt).toLocaleString();

  return (
    <div className="receipt-container bg-white dark:bg-slate-800 dark:border-slate-700 p-6 text-slate-900 dark:text-slate-100 font-mono text-sm max-w-[350px] mx-auto border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="text-center mb-6 space-y-2">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt="Logo" className="w-12 h-12 mx-auto object-cover rounded-lg mb-2" />
        )}
        <h1 className="text-xl font-black uppercase tracking-tighter">{branding.systemName}</h1>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Official Transaction Receipt</p>
        <div className="border-y border-dashed border-slate-300 dark:border-slate-600 py-1 text-[10px]">
          <p>{dateStr}</p>
          <p>Order ID: {sale.id}</p>
          <p>Customer: {sale.customerName?.trim() || 'Customer'}</p>
        </div>
      </div>

      {/* Items */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-600 text-[10px] uppercase text-slate-400 dark:text-slate-500">
            <th className="text-left py-1">Item</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
          {sale.items.map((item, idx) => (
            <tr key={idx} className="text-[11px]">
              <td className="py-2 pr-2">
                <p className="font-bold">{item.productName}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">@ LKR {item.unitPrice.toFixed(2)}</p>
              </td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right font-bold">LKR {item.totalPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="space-y-1 border-t border-slate-200 dark:border-slate-600 pt-4 mb-6">
        <div className="flex justify-between text-xs">
          <span>Subtotal</span>
          <span>LKR {sale.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-black border-t border-slate-100 dark:border-slate-600 pt-1">
          <span>TOTAL</span>
          <span>LKR {sale.totalAmount.toFixed(2)}</span>
        </div>
        
        {sale.paymentMethod === 'cash' && cashReceived !== undefined && (
          <div className="pt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Cash Received</span>
              <span>LKR {cashReceived.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
              <span>Balance</span>
              <span>LKR {(balance || 0).toFixed(2)}</span>
            </div>
          </div>
        )}
        
        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
          <p>Payment Method: <span className="uppercase font-bold">{sale.paymentMethod}</span></p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center space-y-2 pt-4 border-t border-dashed border-slate-300 dark:border-slate-600">
        <p className="font-bold text-xs">THANK YOU FOR SHOPPING!</p>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">Please visit us again</p>
        <div className="flex justify-center gap-1 mt-2">
          <div className="w-1 h-8 bg-slate-900 dark:bg-slate-200"></div>
          <div className="w-2 h-8 bg-slate-900 dark:bg-slate-200"></div>
          <div className="w-0.5 h-8 bg-slate-900 dark:bg-slate-200"></div>
          <div className="w-3 h-8 bg-slate-900 dark:bg-slate-200"></div>
          <div className="w-1 h-8 bg-slate-900 dark:bg-slate-200"></div>
          <div className="w-0.5 h-8 bg-slate-900 dark:bg-slate-200"></div>
          <div className="w-2 h-8 bg-slate-900 dark:bg-slate-200"></div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-container, .receipt-container * { visibility: visible; }
          .receipt-container {
            background: white !important;
            color: #0f172a !important;
            border: none !important;
          }
          .receipt-container * { color: inherit; }
          .receipt-container th, .receipt-container td, .receipt-container p, .receipt-container span { color: #0f172a !important; }
          .receipt-container .text-slate-400, .receipt-container .text-slate-500, .receipt-container .text-slate-600 { color: #475569 !important; }
          .receipt-container [class*="bg-slate"] { background: #0f172a !important; }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;