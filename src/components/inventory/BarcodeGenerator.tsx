"use client";

import React from 'react';
import Barcode from 'react-barcode';

interface BarcodeGeneratorProps {
  value: string;
  name: string;
}

const BarcodeGenerator = ({ value, name }: BarcodeGeneratorProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center">
      <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">GroceryPro System</p>
      <p className="text-sm font-bold mb-2 text-slate-800">{name}</p>
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