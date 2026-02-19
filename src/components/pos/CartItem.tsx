"use client";

import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  };
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-2">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 dark:text-slate-100">{item.name}</h4>
        <p className="text-sm text-gray-500 dark:text-slate-400">LKR {item.price.toFixed(2)} / unit</p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            onClick={() => onUpdateQuantity(item.id, -1)}
          >
            <Minus size={14} />
          </Button>
          <span className="w-8 text-center font-medium text-slate-800 dark:text-slate-200">{item.quantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            onClick={() => onUpdateQuantity(item.id, 1)}
          >
            <Plus size={14} />
          </Button>
        </div>
        
        <div className="w-24 text-right font-bold text-primary dark:text-slate-200">
          LKR {(item.price * item.quantity).toFixed(2)}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;