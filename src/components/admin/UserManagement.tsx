"use client";

import React, { useState } from 'react';
import { UserPlus, Shield, Trash2, MoreVertical, Key, CheckCircle2, XCircle, Edit2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Profile, UserRole, UserPermissions } from '@/types/grocery';
import { showSuccess } from '@/utils/toast';
import FeatureToggles from './FeatureToggles';

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([
    { 
      id: '1', 
      email: 'admin@grocerypro.com', 
      username: 'admin',
      full_name: 'Admin User', 
      role: 'admin',
      permissions: { pos: true, inventory: true, analytics: true, admin: true }
    },
    { 
      id: '2', 
      email: 'sarah.c@grocerypro.com', 
      username: 'sarah_c',
      full_name: 'Sarah Cashier', 
      role: 'cashier',
      permissions: { pos: true, inventory: false, analytics: false, admin: false }
    },
    { 
      id: '3', 
      email: 'mike.m@grocerypro.com', 
      username: 'mike_m',
      full_name: 'Mike Manager', 
      role: 'manager',
      permissions: { pos: true, inventory: true, analytics: true, admin: false }
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'cashier' as UserRole,
    permissions: { pos: true, inventory: false, analytics: false, admin: false }
  });

  // Filter out the main admin from the display list
  const displayUsers = users.filter(u => u.username !== 'admin');

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      username: '',
      email: '',
      password: '',
      role: 'cashier',
      permissions: { pos: true, inventory: false, analytics: false, admin: false }
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      password: '', // Don't show existing password
      role: user.role,
      permissions: { ...user.permissions }
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      showSuccess(`Staff member ${formData.full_name} updated.`);
    } else {
      const newUser: Profile = {
        id: Date.now().toString(),
        ...formData,
      };
      setUsers([...users, newUser]);
      showSuccess(`Staff member ${formData.full_name} created.`);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    showSuccess("Staff member removed.");
  };

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
          <p className="text-slate-500">Manage accounts and individual access permissions</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl border-slate-200">
                <Settings2 className="mr-2" size={18} /> System Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Global System Configuration</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <FeatureToggles />
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
            <UserPlus className="mr-2" size={18} /> Add Staff Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayUsers.map((user) => (
          <Card key={user.id} className="p-5 border-slate-200 shadow-sm hover:shadow-md transition-all bg-white">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                  {user.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{user.full_name}</h3>
                  <p className="text-xs text-slate-500">@{user.username} • {user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={`capitalize px-2 py-0.5 rounded-md border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                    <div className="flex gap-1">
                      {Object.entries(user.permissions).map(([key, val]) => val && (
                        <div key={key} className="w-2 h-2 rounded-full bg-green-500" title={key} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(user)}>
                  <Edit2 size={16} className="text-slate-400" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Key size={14} /> Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 size={14} /> Delete Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit Staff Member' : 'Create New Staff Account'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="johndoe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@grocerypro.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{editingUser ? 'New Password (leave blank to keep current)' : 'Initial Password'}</Label>
              <Input id="password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Primary Role</Label>
              <Select value={formData.role} onValueChange={(v: UserRole) => setFormData({...formData, role: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Access Permissions</Label>
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(formData.permissions) as Array<keyof UserPermissions>).map((perm) => (
                  <div key={perm} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`edit-${perm}`} 
                      checked={formData.permissions[perm]} 
                      onCheckedChange={(checked) => setFormData({
                        ...formData, 
                        permissions: {...formData.permissions, [perm]: !!checked}
                      })}
                    />
                    <Label htmlFor={`edit-${perm}`} className="capitalize">{perm}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingUser ? 'Save Changes' : 'Create Account'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;