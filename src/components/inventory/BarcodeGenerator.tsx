"use client";

import React from 'react';
import Barcode from 'react-barcode';

interface BarcodeGeneratorProps {
  value: string;
  name: string;
  sku?: string;
  price?: number;
  category?: string;
  supplier?: string;
}

const BarcodeGenerator = ({ value, name, sku, price, category, supplier }: BarcodeGeneratorProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center">
      <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">GroceryPro System</p>
      <p className="text-sm font-bold mb-1 text-slate-800">{name}</p>
      {sku && <p className="text-[10px] text-slate-600 mb-1">SKU: {sku}</p>}
      {category && <p className="text-[10px] text-slate-600 mb-1">{category}</p>}
      {supplier && <p className="text-[10px] text-slate-600 mb-1">Supplier: {supplier}</p>}
      {price != null && <p className="text-[10px] text-slate-600 mb-1">LKR {price.toFixed(2)}</p>}
      <Barcode 
        value={value} 
        width={1.5} 
        height={50} 
        fontSize={12}
        background="transparent"
      />
    </div>
  );
};

export default BarcodeGenerator;