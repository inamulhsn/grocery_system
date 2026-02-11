"use client";

import React, { useState } from 'react';
import { Users, UserPlus, Shield, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Profile, UserRole } from '@/types/grocery';

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([
    { id: '1', email: 'admin@grocerypro.com', full_name: 'Admin User', role: 'admin' },
    { id: '2', email: 'sarah.c@grocerypro.com', full_name: 'Sarah Cashier', role: 'cashier' },
    { id: '3', email: 'mike.m@grocerypro.com', full_name: 'Mike Manager', role: 'manager' },
  ]);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cashier': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
          <p className="text-slate-500">Manage your team and their access levels</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl">
          <UserPlus className="mr-2" size={18} /> Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-5 border-slate-200 shadow-sm hover:shadow-md transition-all bg-white group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                {user.full_name.split(' ').map(n => n[0]).join('')}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Shield size={14} /> Change Role
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-600">
                    <Trash2 size={14} /> Remove Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800">{user.full_name}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <Badge className={`capitalize px-3 py-1 rounded-lg border ${getRoleColor(user.role)}`}>
                {user.role}
              </Badge>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;