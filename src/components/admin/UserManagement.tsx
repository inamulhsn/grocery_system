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
  sales: { ...defaultSectionPerms, view: true },
  refill: { ...defaultSectionPerms },
  customers: { ...defaultSectionPerms },
  suppliers: { ...defaultSectionPerms }
};

// Only these sections are configurable per user. Activity Logs & main Admin Panel are admin-only.
const CONFIGURABLE_SECTIONS: Array<keyof UserPermissions> = ['pos', 'inventory', 'sales', 'refill', 'customers', 'suppliers'];

// Define which permission options each section supports
const SECTION_PERMISSION_OPTIONS: Partial<Record<keyof UserPermissions, Array<keyof SectionPermissions>>> = {
  sales: ['view'], // Sales: view only
  refill: ['view'], // Refill: view only
  customers: ['view', 'create', 'edit', 'delete'], // Customers: all four
  suppliers: ['view', 'create', 'edit', 'delete'], // Suppliers: all four
  pos: ['view', 'create', 'edit', 'delete'], // POS: all four
  inventory: ['view', 'create', 'edit', 'delete'] // Inventory: all four
};
const ROLE_OPTIONS: UserRole[] = ['cashier', 'manager', 'hr'];

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
    phone_number: '',
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
      phone_number: '',
      role: 'cashier',
      permissions: { ...defaultPermissions }
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    
    // SAFE PERMISSION PARSING - handle both object and JSON string
    let savedPerms = { ...defaultPermissions };
    
    // Try to get permissions from user object
    if (user.permissions) {
      if (typeof user.permissions === 'string') {
        try {
          savedPerms = JSON.parse(user.permissions);
        } catch (e) {
          console.error("Permission parse error", e);
        }
      } else if (typeof user.permissions === 'object') {
        // Merge with defaults to ensure all sections exist
        savedPerms = {
          pos: { ...defaultSectionPerms, ...(user.permissions.pos || {}) },
          inventory: { ...defaultSectionPerms, ...(user.permissions.inventory || {}) },
          sales: { ...defaultSectionPerms, ...(user.permissions.sales || {}) },
          refill: { ...defaultSectionPerms, ...(user.permissions.refill || {}) },
          customers: { ...defaultSectionPerms, ...(user.permissions.customers || {}) },
          suppliers: { ...defaultSectionPerms, ...(user.permissions.suppliers || {}) }
        };
      }
    }

    // If user is admin, set all permissions to true
    if (user.role === 'admin') {
      savedPerms = {
        pos: { view: true, create: true, edit: true, delete: true },
        inventory: { view: true, create: true, edit: true, delete: true },
        sales: { view: true, create: true, edit: true, delete: true },
        refill: { view: true, create: true, edit: true, delete: true },
        customers: { view: true, create: true, edit: true, delete: true },
        suppliers: { view: true, create: true, edit: true, delete: true }
      };
    }

    setFormData({
      full_name: user.fullName || user.full_name || '',
      username: user.username || '',
      email: user.email || '',
      password: '', // Don't populate password for security
      phone_number: user.phone_number || '',
      role: (user.role as UserRole) || 'cashier',
      permissions: savedPerms
    });
    setIsDialogOpen(true);
  };

  // Simple email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    try {
      // Validate email if provided
      if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
        showError("Please enter a valid email address.");
        return;
      }

      // If admin role, ensure all permissions are true
      let finalPermissions = { ...formData.permissions };
      if (formData.role === 'admin') {
        finalPermissions = {
          pos: { view: true, create: true, edit: true, delete: true },
          inventory: { view: true, create: true, edit: true, delete: true },
          sales: { view: true, create: true, edit: true, delete: true },
          refill: { view: true, create: true, edit: true, delete: true },
          customers: { view: true, create: true, edit: true, delete: true },
          suppliers: { view: true, create: true, edit: true, delete: true }
        };
      }

      const payload: any = {
        id: editingUser ? editingUser.id : undefined,
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.full_name.trim(),
        role: formData.role,
        permissionsJson: JSON.stringify(finalPermissions),
        phone_number: formData.phone_number.trim()
      };

      // Only include password if provided (for new users or password changes)
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      if (editingUser) {
        await api.updateUser(payload);
        showSuccess("Staff record updated.");
      } else {
        if (!formData.password || !formData.password.trim()) {
          showError("Password is required for new users.");
          return;
        }
        await api.saveUser(payload);
        showSuccess("New staff member created.");
      }
      
      await loadUsers();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sync with database.";
      showError(errorMessage);
    }
  };

  const handleDelete = async (id: string, name: string, userForRevert?: Profile) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.deleteUser(id, userForRevert);
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
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Staff Management</h2>
            <p className="text-slate-500 dark:text-slate-400">Manage database roles and permissions</p>
          </div>
          <Button onClick={openAddDialog} className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl">
            <UserPlus className="mr-2" size={18} /> Add Staff
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(users || []).filter(u => u.username !== 'admin').map((user) => (
            <Card key={user.id} className="p-5 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg">
                    {(user.fullName || 'User').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{user.fullName || 'Unnamed User'}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
                    <Badge className="mt-2 capitalize bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">{user.role}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    <Edit2 size={16} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400"><MoreVertical size={16} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                      <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20" onClick={() => handleDelete(user.id, user.full_name || 'User', user)}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-slate-800">
        <BrandingSettings settings={branding} onUpdate={onUpdateBranding} />
        <AdminSecurity adminProfile={currentUser} onUpdate={onUpdateAdminProfile} />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">{editingUser ? 'Edit Staff Member' : 'Create Staff Account'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Full Name</Label>
                <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Username</Label>
                <Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Email (optional)</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="user@example.com" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Must be a valid email format if provided</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Password</Label>
                <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Required for new, optional for edit" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Phone Number</Label>
              <Input value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="+94 77 123 4567" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Role</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2 text-slate-800 dark:text-slate-100"><Lock size={18}/> Section Permissions</h3>
              {formData.role === 'admin' && (
                <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  Admin role has full access to all sections, including <strong>Admin Panel</strong> and <strong>Activity Logs</strong>. These are not configurable.
                </p>
              )}
              {CONFIGURABLE_SECTIONS.map((section) => {
                const allowedActions = SECTION_PERMISSION_OPTIONS[section] || ['view', 'create', 'edit', 'delete'];
                return (
                  <div key={section} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Label className="capitalize font-black mb-3 block text-slate-800 dark:text-slate-200">{section}</Label>
                    <div className={`grid gap-4 ${allowedActions.length === 1 ? 'grid-cols-1' : allowedActions.length === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                      {allowedActions.map((action) => {
                        const isChecked = formData.role === 'admin' ? true : (formData.permissions[section]?.[action] ?? false);
                        return (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${section}-${action}`} 
                              checked={isChecked} 
                              disabled={formData.role === 'admin'} 
                              onCheckedChange={() => {
                                if (formData.role !== 'admin') {
                                  togglePermission(section, action as keyof SectionPermissions);
                                }
                              }} 
                            />
                            <Label htmlFor={`${section}-${action}`} className="capitalize text-xs cursor-pointer text-slate-700 dark:text-slate-300">{action}</Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter className="border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</Button>
            <Button onClick={handleSave} className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white">Save to Database</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;