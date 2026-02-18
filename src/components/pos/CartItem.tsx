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
    <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-2">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800">{item.name}</h4>
        <p className="text-sm text-gray-500">LKR {item.price.toFixed(2)} / unit</p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.id, -1)}
          >
            <Minus size={14} />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.id, 1)}
          >
            <Plus size={14} />
          </Button>
        </div>
        
        <div className="w-24 text-right font-bold text-primary">
          LKR {(item.price * item.quantity).toFixed(2)}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-red-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;