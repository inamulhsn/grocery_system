"use client";

import React, { useState } from 'react';
import { Users, UserPlus, Shield, Trash2, MoreVertical, Key, CheckCircle2, XCircle } from 'lucide-react';
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
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'cashier' as UserRole,
    permissions: { pos: true, inventory: false, analytics: false, admin: false }
  });

  const handleAddUser = () => {
    const user: Profile = {
      id: Date.now().toString(),
      ...newUser,
    };
    setUsers([...users, user]);
    setIsAddDialogOpen(false);
    showSuccess(`Staff member ${newUser.full_name} created successfully.`);
    setNewUser({
      full_name: '',
      username: '',
      email: '',
      password: '',
      role: 'cashier',
      permissions: { pos: true, inventory: false, analytics: false, admin: false }
    });
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    showSuccess("Staff member removed.");
  };

  const togglePermission = (userId: string, permission: keyof UserPermissions) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: { ...u.permissions, [permission]: !u.permissions[permission] }
        };
      }
      return u;
    }));
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
          <p className="text-slate-500">Create accounts and manage individual access permissions</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl">
              <UserPlus className="mr-2" size={18} /> Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Staff Account</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="johndoe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="john@grocerypro.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input id="password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Primary Role</Label>
                <Select value={newUser.role} onValueChange={(v: UserRole) => setNewUser({...newUser, role: v})}>
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
                <Label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Initial Access Permissions</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(newUser.permissions).map((perm) => (
                    <div key={perm} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`new-${perm}`} 
                        checked={newUser.permissions[perm as keyof UserPermissions]} 
                        onCheckedChange={(checked) => setNewUser({
                          ...newUser, 
                          permissions: {...newUser.permissions, [perm]: !!checked}
                        })}
                      />
                      <Label htmlFor={`new-${perm}`} className="capitalize">{perm}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Create Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-5 border-slate-200 shadow-sm hover:shadow-md transition-all bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                  {user.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{user.full_name}</h3>
                  <p className="text-xs text-slate-500">@{user.username} • {user.email}</p>
                  <Badge className={`mt-2 capitalize px-2 py-0.5 rounded-md border ${getRoleColor(user.role)}`}>
                    {user.role}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
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
            
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Module Access Control</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(Object.keys(user.permissions) as Array<keyof UserPermissions>).map((perm) => (
                  <button
                    key={perm}
                    onClick={() => togglePermission(user.id, perm)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      user.permissions[perm] 
                        ? 'bg-green-50 border-green-100 text-green-700' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold capitalize">{perm}</span>
                    {user.permissions[perm] ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;