"use client";

import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit2, Phone, MessageCircle } from 'lucide-react';
import { hasPermission } from '@/utils/permissions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Customer } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';
import { api } from '@/utils/api';

const CustomerManager = () => {
  const canView = hasPermission('customers','view');
  const canCreate = hasPermission('customers','create');
  const canEdit = hasPermission('customers','edit');
  const canDelete = hasPermission('customers','delete');
  if (!canView) {
    return <div className="p-10 text-center text-red-600 dark:text-red-400">Access denied</div>;
  }
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    mobileNumber: '',
    whatsAppNumber: '',
  });
  const [whatsAppSameAsMobile, setWhatsAppSameAsMobile] = useState(false);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data || []);
    } catch (error) {
      showError('Failed to load customers.');
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      address: '',
      mobileNumber: '',
      whatsAppNumber: '',
    });
    setWhatsAppSameAsMobile(false);
    setIsDialogOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    const mobile = c.mobileNumber || '';
    const whatsApp = c.whatsAppNumber || '';
    setFormData({
      name: c.name || '',
      email: c.email || '',
      address: c.address || '',
      mobileNumber: mobile,
      whatsAppNumber: whatsApp,
    });
    setWhatsAppSameAsMobile(mobile !== '' && mobile === whatsApp);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('Name is required.');
      return;
    }
    const payload = {
      ...formData,
      whatsAppNumber: whatsAppSameAsMobile ? formData.mobileNumber : formData.whatsAppNumber,
    };
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, payload);
        showSuccess('Customer updated.');
      } else {
        await api.createCustomer(payload);
        showSuccess('Customer added.');
      }
      await loadCustomers();
      setIsDialogOpen(false);
    } catch (error) {
      showError('Failed to save customer.');
    }
  };

  const handleDelete = async (c: Customer) => {
    if (!confirm(`Delete customer "${c.name}"?`)) return;
    try {
      await api.deleteCustomer(c.id);
      showSuccess('Customer removed.');
      await loadCustomers();
    } catch (error) {
      showError('Failed to delete customer.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Customers</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage customer contacts (name, email, address, mobile &amp; WhatsApp)</p>
        </div>
        {canCreate && (
          <Button onClick={openAdd} className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl">
            <UserPlus className="mr-2" size={18} /> Add Customer
          </Button>
        )} 
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Name</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Email</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Address</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Mobile</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">WhatsApp</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No customers yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{c.email || '—'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={c.address}>{c.address || '—'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      {c.mobileNumber ? <><Phone size={12} className="text-slate-400" /> {c.mobileNumber}</> : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      {c.whatsAppNumber ? <><MessageCircle size={12} className="text-green-500" /> {c.whatsAppNumber}</> : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                          <Edit2 size={16} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name or company"
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street, city"
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-1"><Phone size={14} /> Mobile number</Label>
                <Input
                  value={formData.mobileNumber}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      mobileNumber: v,
                      ...(whatsAppSameAsMobile ? { whatsAppNumber: v } : {}),
                    }));
                  }}
                  placeholder="+94 77 123 4567"
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customer-whatsapp-same"
                  checked={whatsAppSameAsMobile}
                  onCheckedChange={(checked) => {
                    const isSame = !!checked;
                    setWhatsAppSameAsMobile(isSame);
                    if (isSame) setFormData(prev => ({ ...prev, whatsAppNumber: prev.mobileNumber }));
                  }}
                  className="dark:border-slate-600 data-[state=checked]:dark:bg-slate-700"
                />
                <Label htmlFor="customer-whatsapp-same" className="text-slate-700 dark:text-slate-300 cursor-pointer text-sm font-normal">
                  Same as mobile number (use for WhatsApp)
                </Label>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-1"><MessageCircle size={14} /> WhatsApp number</Label>
                <Input
                  value={whatsAppSameAsMobile ? formData.mobileNumber : formData.whatsAppNumber}
                  onChange={(e) => !whatsAppSameAsMobile && setFormData(prev => ({ ...prev, whatsAppNumber: e.target.value }))}
                  placeholder="+94 77 123 4567"
                  disabled={whatsAppSameAsMobile}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={editingCustomer ? !canEdit : !canCreate}
              className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManager;
