"use client";

import React, { useState } from 'react';
import { Shield, Smartphone, Key, User, Save, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Profile } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';

interface AdminSecurityProps {
  adminProfile: Profile;
  onUpdate: (updatedProfile: Profile) => void;
}

const AdminSecurity = ({ adminProfile, onUpdate }: AdminSecurityProps) => {
  const [formData, setFormData] = useState({
    username: adminProfile.username,
    password: adminProfile.password || 'admin',
    phone_number: adminProfile.phone_number || '+1234567890'
  });

  const handleSave = () => {
    if (!formData.username || !formData.password || !formData.phone_number) {
      showError("All fields are required");
      return;
    }

    const updatedProfile = {
      ...adminProfile,
      username: formData.username,
      password: formData.password,
      phone_number: formData.phone_number
    };

    onUpdate(updatedProfile);
    
    // Simulate SMS sending
    setTimeout(() => {
      showSuccess(`SMS Sent to ${formData.phone_number}: Credentials updated! New User: ${formData.username}, Pass: ${formData.password}`);
    }, 500);
    
    showSuccess("Security settings updated successfully");
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-slate-700 flex items-center justify-center text-primary dark:text-slate-300">
          <Shield size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Admin Security Settings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Update your login credentials and recovery phone</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <User size={14} className="text-slate-400 dark:text-slate-500" /> Admin Username
            </Label>
            <Input 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})}
              placeholder="admin"
              className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Key size={14} className="text-slate-400 dark:text-slate-500" /> Admin Password
            </Label>
            <Input 
              type="password"
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Smartphone size={14} className="text-slate-400 dark:text-slate-500" /> Registered Mobile Number (for SMS alerts)
          </Label>
          <Input 
            value={formData.phone_number} 
            onChange={e => setFormData({...formData, phone_number: e.target.value})}
            placeholder="+1 234 567 890"
            className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
          />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
            * A notification will be sent to this number whenever credentials are changed.
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          className="w-full bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 hover:bg-primary/90 text-white rounded-xl font-bold mt-2"
        >
          <Save size={18} className="mr-2" /> Save & Notify via SMS
        </Button>
      </div>
    </Card>
  );
};

export default AdminSecurity;