"use client";

import React, { useState } from 'react';
import { UserPlus, Shield, Trash2, MoreVertical, Key, Edit2, Settings2, Lock, User } from 'lucide-react';
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
import { Profile, UserRole, UserPermissions, SectionPermissions, SystemSettings } from '@/types/grocery';
import { showSuccess } from '@/utils/toast';
import FeatureToggles from './FeatureToggles';
import BrandingSettings from './BrandingSettings';
import AdminSecurity from './AdminSecurity';

const defaultSectionPerms: SectionPermissions = { view: false, create: false, edit: false, delete: false };

interface UserManagementProps {
  branding: SystemSettings;
  onUpdateBranding: (settings: SystemSettings) => void;
  currentUser: Profile;
  onUpdateAdminProfile: (profile: Profile) => void;
}

const UserManagement = ({ branding, onUpdateBranding, currentUser, onUpdateAdminProfile }: UserManagementProps) => {
  const [users, setUsers] = useState<Profile[]>([
    { 
      id: '1', 
      email: 'admin@grocerypro.com', 
      username: 'admin',
      full_name: 'Admin User', 
      role: 'admin',
      permissions: { 
        pos: { view: true, create: true, edit: true, delete: true },
        inventory: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, create: true, edit: true, delete: true },
        admin: { view: true, create: true, edit: true, delete: true }
      }
    },
    { 
      id: '2', 
      email: 'sarah.c@grocerypro.com', 
      username: 'sarah_c',
      full_name: 'Sarah Cashier', 
      role: 'cashier',
      permissions: { 
        pos: { view: true, create: true, edit: false, delete: false },
        inventory: { view: true, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
        admin: { view: false, create: false, edit: false, delete: false }
      }
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'cashier' as UserRole,
    permissions: { 
      pos: { ...defaultSectionPerms, view: true },
      inventory: { ...defaultSectionPerms },
      analytics: { ...defaultSectionPerms },
      admin: { ...defaultSectionPerms }
    } as UserPermissions
  });

  const displayUsers = users.filter(u => u.username !== 'admin');

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      username: '',
      email: '',
      password: '',
      role: 'cashier',
      permissions: { 
        pos: { ...defaultSectionPerms, view: true, create: true },
        inventory: { ...defaultSectionPerms },
        analytics: { ...defaultSectionPerms },
        admin: { ...defaultSectionPerms }
      }
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      password: user.password || '',
      role: user.role,
      permissions: JSON.parse(JSON.stringify(user.permissions))
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

  const togglePermission = (section: keyof UserPermissions, action: keyof SectionPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          ...prev.permissions[section],
          [action]: !prev.permissions[section][action]
        }
      }
    }));
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
            <p className="text-slate-500">Manage accounts and granular CRUD permissions</p>
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
                      <Badge className="capitalize px-2 py-0.5 rounded-md border bg-green-50 text-green-700 border-green-200">
                        {user.role}
                      </Badge>
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
                        onClick={() => setUsers(users.filter(u => u.id !== user.id))}
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
      </div>

      {currentUser.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">System Branding</h2>
            <BrandingSettings settings={branding} onUpdate={onUpdateBranding} />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Admin Security</h2>
            <AdminSecurity adminProfile={currentUser} onUpdate={onUpdateAdminProfile} />
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit Staff Member' : 'Create New Staff Account'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="johndoe" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@grocerypro.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v: UserRole) => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b pb-2">
                <Lock size={18} className="text-primary" />
                <h3>Granular Access Permissions</h3>
              </div>
              
              <div className="space-y-4">
                {(Object.keys(formData.permissions) as Array<keyof UserPermissions>).map((section) => (
                  <div key={section} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="capitalize font-black text-slate-700 tracking-wide">{section} Section</Label>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {(['view', 'create', 'edit', 'delete'] as Array<keyof SectionPermissions>).map((action) => (
                        <div key={action} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`${section}-${action}`} 
                            checked={formData.permissions[section][action]} 
                            onCheckedChange={() => togglePermission(section, action)}
                          />
                          <Label htmlFor={`${section}-${action}`} className="capitalize text-xs font-medium cursor-pointer">
                            {action}
                          </Label>
                        </div>
                      ))}
                    </div>
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