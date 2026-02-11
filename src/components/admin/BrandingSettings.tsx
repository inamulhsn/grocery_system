"use client";

import React, { useState } from 'react';
import { Layout, Type, Image as ImageIcon, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SystemSettings } from '@/types/grocery';
import { showSuccess } from '@/utils/toast';

interface BrandingSettingsProps {
  settings: SystemSettings;
  onUpdate: (updatedSettings: SystemSettings) => void;
}

const BrandingSettings = ({ settings, onUpdate }: BrandingSettingsProps) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });

  const handleSave = () => {
    onUpdate(formData);
    showSuccess("Branding settings updated successfully");
  };

  return (
    <Card className="p-6 border-slate-200 shadow-sm bg-white">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Layout size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800">System Branding</h3>
          <p className="text-xs text-slate-500">Customize the look and feel of your terminal</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Type size={14} className="text-slate-400" /> System Name
          </Label>
          <Input 
            value={formData.systemName} 
            onChange={e => setFormData({...formData, systemName: e.target.value})}
            placeholder="e.g. GroceryPro"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ImageIcon size={14} className="text-slate-400" /> Logo Image URL
          </Label>
          <Input 
            value={formData.logoUrl} 
            onChange={e => setFormData({...formData, logoUrl: e.target.value})}
            placeholder="https://example.com/logo.png"
            className="rounded-xl"
          />
          <p className="text-[10px] text-slate-400 font-medium italic">
            * Provide a URL to an image file (PNG, SVG, or JPG).
          </p>
        </div>

        <div className="pt-2">
          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Preview</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg" />
            )}
            <span className="font-black text-lg">{formData.systemName}</span>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl font-bold mt-2"
        >
          <Save size={18} className="mr-2" /> Save Branding Changes
        </Button>
      </div>
    </Card>
  );
};

export default BrandingSettings;