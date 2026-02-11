"use client";

import React, { useState } from 'react';
import { Settings2, Eye, Printer, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const FeatureToggles = () => {
  const [toggles, setToggles] = useState({
    showProfitMargin: false,
    enableBarcodePrinting: true,
    allowPendingBills: true,
    realTimeInventory: true
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
        <p className="text-slate-500">Control feature visibility and system behavior</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-slate-200 shadow-sm bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Eye size={20} />
            </div>
            <div>
              <Label className="text-base font-bold">Show Profit Margins</Label>
              <p className="text-xs text-slate-500">Display cost price and profit to managers</p>
            </div>
          </div>
          <Switch 
            checked={toggles.showProfitMargin} 
            onCheckedChange={() => handleToggle('showProfitMargin')} 
          />
        </Card>

        <Card className="p-6 border-slate-200 shadow-sm bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Printer size={20} />
            </div>
            <div>
              <Label className="text-base font-bold">Barcode Printing</Label>
              <p className="text-xs text-slate-500">Enable label generation in inventory</p>
            </div>
          </div>
          <Switch 
            checked={toggles.enableBarcodePrinting} 
            onCheckedChange={() => handleToggle('enableBarcodePrinting')} 
          />
        </Card>

        <Card className="p-6 border-slate-200 shadow-sm bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Clock size={20} />
            </div>
            <div>
              <Label className="text-base font-bold">Pending Bills</Label>
              <p className="text-xs text-slate-500">Allow cashiers to save orders for later</p>
            </div>
          </div>
          <Switch 
            checked={toggles.allowPendingBills} 
            onCheckedChange={() => handleToggle('allowPendingBills')} 
          />
        </Card>

        <Card className="p-6 border-slate-200 shadow-sm bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <Settings2 size={20} />
            </div>
            <div>
              <Label className="text-base font-bold">Real-time Sync</Label>
              <p className="text-xs text-slate-500">Sync stock levels across all terminals</p>
            </div>
          </div>
          <Switch 
            checked={toggles.realTimeInventory} 
            onCheckedChange={() => handleToggle('realTimeInventory')} 
          />
        </Card>
      </div>
    </div>
  );
};

export default FeatureToggles;