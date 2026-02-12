"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Lock, ArrowRight, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { api } from '@/utils/api'; // Import the API helper
import { SystemSettings } from '@/types/grocery';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Default branding until loaded from DB
  const [branding, setBranding] = useState<SystemSettings>({
    systemName: 'GroceryPro',
    logoUrl: ''
  });
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  // Load branding from DB when page opens
  useEffect(() => {
    const loadBranding = async () => {
      try {
        const settings = await api.getBranding();
        if (settings) setBranding(settings);
      } catch (e) {
        console.log("Using default branding");
      }
    };
    loadBranding();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Call the Backend API
      const user = await api.login({
        identifier: formData.identifier,
        password: formData.password
      });

      // 2. If successful, save user to LocalStorage (so you stay logged in)
      localStorage.setItem('grocery_user', JSON.stringify(user));
      
      showSuccess(`Welcome back, ${user.fullName}!`);
      
      // 3. Go to Dashboard
      navigate('/');
      
    } catch (error) {
      showError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-[450px] space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-primary rounded-2xl items-center justify-center text-white shadow-xl shadow-primary/20 mb-4 overflow-hidden">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <TrendingUp size={32} />
            )}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {branding.systemName}
          </h1>
          <p className="text-slate-500 font-medium">Management System Terminal</p>
        </div>

        <Card className="p-8 border-none shadow-2xl shadow-slate-200/60 rounded-3xl bg-white">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  id="identifier"
                  type="text" 
                  placeholder="admin" 
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:border-primary transition-all"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="•••••" 
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:border-primary transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;