"use client";

import React, { useState, useRef } from 'react';
import { Layout, Type, Image as ImageIcon, Save, Upload, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SystemSettings } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';

interface BrandingSettingsProps {
  settings: SystemSettings;
  onUpdate: (updatedSettings: SystemSettings) => void;
}

const BrandingSettings = ({ settings, onUpdate }: BrandingSettingsProps) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(formData);
    showSuccess("Branding settings updated successfully");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError("File is too large. Please choose an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            <ImageIcon size={14} className="text-slate-400" /> System Logo
          </Label>
          
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input 
                value={formData.logoUrl.startsWith('data:') ? 'Local Image Uploaded' : formData.logoUrl} 
                onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                placeholder="Paste image URL..."
                className="rounded-xl flex-1"
                disabled={formData.logoUrl.startsWith('data:')}
              />
              {formData.logoUrl && (
                <Button variant="outline" size="icon" onClick={clearLogo} className="rounded-xl shrink-0">
                  <X size={16} />
                </Button>
              )}
            </div>
            
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button 
                variant="secondary" 
                className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 h-12"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} className="mr-2" /> Upload Logo Image
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Preview</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white overflow-hidden shadow-sm">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Layout size={20} />
              )}
            </div>
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