"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Lock, ArrowRight, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // This will hold either username or email
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get persisted admin profile
    const savedAdmin = localStorage.getItem('grocery_admin_profile');
    const admin = savedAdmin ? JSON.parse(savedAdmin) : { 
      username: 'admin', 
      email: 'admin@grocerypro.com', 
      password: 'admin' 
    };

    // Mock login logic
    setTimeout(() => {
      const isCorrectIdentifier = formData.identifier === admin.username || formData.identifier === admin.email;
      const isCorrectPassword = formData.password === admin.password;

      if (isCorrectIdentifier && isCorrectPassword) {
        showSuccess("Welcome back to GroceryPro!");
        navigate('/');
      } else {
        showError("Invalid credentials. Please check your username/email and password.");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-[450px] space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-primary rounded-2xl items-center justify-center text-white shadow-xl shadow-primary/20 mb-4">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Grocery<span className="text-primary">Pro</span>
          </h1>
          <p className="text-slate-500 font-medium">Management System Terminal</p>
        </div>

        <Card className="p-8 border-none shadow-2xl shadow-slate-200/60 rounded-3xl bg-white">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  id="identifier"
                  type="text" 
                  placeholder="admin or admin@grocerypro.com" 
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
                <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
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

        <p className="text-center text-sm text-slate-500">
          Authorized personnel only. <br/>
          Contact your administrator for access credentials.
        </p>
      </div>
    </div>
  );
};

export default Login;