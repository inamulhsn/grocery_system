"use client";

import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, MoreVertical, Edit2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Profile, UserRole, UserPermissions, SectionPermissions, SystemSettings } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';
import { api } from '@/utils/api';
import BrandingSettings from './BrandingSettings';
import AdminSecurity from './AdminSecurity';

const defaultSectionPerms: SectionPermissions = { view: false, create: false, edit: false, delete: false };
const defaultPermissions: UserPermissions = {
  pos: { ...defaultSectionPerms, view: true },
  inventory: { ...defaultSectionPerms },
  analytics: { ...defaultSectionPerms },
  admin: { ...defaultSectionPerms }
};

interface UserManagementProps {
  branding: SystemSettings;
  onUpdateBranding: (settings: SystemSettings) => void;
  currentUser: Profile;
  onUpdateAdminProfile: (profile: Profile) => void;
}

const UserManagement = ({ branding, onUpdateBranding, currentUser, onUpdateAdminProfile }: UserManagementProps) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'cashier' as UserRole,
    permissions: { ...defaultPermissions }
  });

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (error) {
      showError("Database connection failed.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      username: '',
      email: '',
      password: '',
      role: 'cashier',
      permissions: { ...defaultPermissions }
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    
    // SAFE PERMISSION PARSING
    let savedPerms = { ...defaultPermissions };
    const rawPerms = user.permissions || user.permissions;
    
    if (rawPerms) {
      try {
        savedPerms = typeof rawPerms === 'string' ? JSON.parse(rawPerms) : rawPerms;
      } catch (e) {
        console.error("Permission parse error", e);
      }
    }

    setFormData({
      full_name: user.full_name || user.full_name || '',
      username: user.username || '',
      email: user.email || '',
      password: '', 
      role: (user.role as UserRole) || 'cashier',
      permissions: savedPerms
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        id: editingUser ? editingUser.id : undefined,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.full_name, // Map to Backend PascalCase
        role: formData.role,
        permissionsJson: JSON.stringify(formData.permissions) // Send as String for Postgres
      };

      if (editingUser) {
        await api.updateUser(payload);
        showSuccess("Staff record updated.");
      } else {
        await api.saveUser(payload);
        showSuccess("New staff member created.");
      }
      
      await loadUsers();
      setIsDialogOpen(false);
    } catch (error) {
      showError("Failed to sync with database.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.deleteUser(id);
        showSuccess("Account deleted.");
        await loadUsers();
      } catch (error) {
        showError("Failed to delete account.");
      }
    }
  };

  const togglePermission = (section: keyof UserPermissions, action: keyof SectionPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: { ...prev.permissions[section], [action]: !prev.permissions[section][action] }
      }
    }));
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
            <p className="text-slate-500">Manage database roles and permissions</p>
          </div>
          <Button onClick={openAddDialog} className="bg-primary text-white rounded-xl">
            <UserPlus className="mr-2" size={18} /> Add Staff
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(users || []).filter(u => u.username !== 'admin').map((user) => (
            <Card key={user.id} className="p-5 border-slate-200 shadow-sm bg-white">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {/* SAFE AVATAR: split check for undefined/null names */}
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                    {(user.full_name || user.full_name || 'User')
                      .split(' ')
                      .filter(Boolean)
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{user.full_name || user.full_name || 'Unnamed User'}</h3>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                    <Badge className="mt-2 capitalize bg-green-50 text-green-700">{user.role}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                    <Edit2 size={16} className="text-slate-400" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical size={16} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id, user.full_name || user.full_name || 'User')}>
                        <Trash2 size={14} className="mr-2" /> Delete Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t">
        <BrandingSettings settings={branding} onUpdate={onUpdateBranding} />
        <AdminSecurity adminProfile={currentUser} onUpdate={onUpdateAdminProfile} />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit Staff Member' : 'Create Staff Account'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Required for new, optional for edit" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold border-b pb-2 flex items-center gap-2"><Lock size={18}/> Permissions</h3>
              {(Object.keys(formData.permissions) as Array<keyof UserPermissions>).map((section) => (
                <div key={section} className="bg-slate-50 p-4 rounded-xl border">
                  <Label className="capitalize font-black mb-3 block">{section} Section</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {(['view', 'create', 'edit', 'delete'] as Array<keyof SectionPermissions>).map((action) => (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${section}-${action}`} 
                          checked={formData.permissions[section][action]} 
                          onCheckedChange={() => togglePermission(section, action)}
                        />
                        <Label htmlFor={`${section}-${action}`} className="capitalize text-xs cursor-pointer">{action}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-primary text-white">Save to Database</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;