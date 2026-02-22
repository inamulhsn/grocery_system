"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Trash2, Edit2, Phone, MessageCircle } from 'lucide-react';
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
import { Supplier } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';
import { api } from '@/utils/api';

const SupplierManager = () => {
  const canView = hasPermission('suppliers','view');
  const canCreate = hasPermission('suppliers','create');
  const canEdit = hasPermission('suppliers','edit');
  const canDelete = hasPermission('suppliers','delete');
  if (!canView) {
    return <div className="p-10 text-center text-red-600 dark:text-red-400">Access denied</div>;
  }
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    mobileNumber: '',
    whatsAppNumber: '',
  });
  const [whatsAppSameAsMobile, setWhatsAppSameAsMobile] = useState(false);

  const loadSuppliers = async () => {
    try {
      const data = await api.getSuppliers();
      setSuppliers(data || []);
    } catch (error) {
      showError('Failed to load suppliers.');
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openAdd = () => {
    setEditingSupplier(null);
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

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    const mobile = s.mobileNumber || '';
    const whatsApp = s.whatsAppNumber || '';
    setFormData({
      name: s.name || '',
      email: s.email || '',
      address: s.address || '',
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
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, payload);
        showSuccess('Supplier updated.');
      } else {
        await api.createSupplier(payload);
        showSuccess('Supplier added.');
      }
      await loadSuppliers();
      setIsDialogOpen(false);
    } catch (error) {
      showError('Failed to save supplier.');
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (!confirm(`Delete supplier "${s.name}"?`)) return;
    try {
      await api.deleteSupplier(s.id);
      showSuccess('Supplier removed.');
      await loadSuppliers();
    } catch (error) {
      showError('Failed to delete supplier.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Suppliers</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage supplier contacts (name, email, address, mobile &amp; WhatsApp)</p>
        </div>
        {canCreate && (
          <Button onClick={openAdd} className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl">
            <Truck className="mr-2" size={18} /> Add Supplier
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
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No suppliers yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{s.email || '—'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={s.address}>{s.address || '—'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      {s.mobileNumber ? <><Phone size={12} className="text-slate-400" /> {s.mobileNumber}</> : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      {s.whatsAppNumber ? <><MessageCircle size={12} className="text-green-500" /> {s.whatsAppNumber}</> : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                          <Edit2 size={16} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(s)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
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
              {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Company or contact name"
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@supplier.com"
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
                  id="supplier-whatsapp-same"
                  checked={whatsAppSameAsMobile}
                  onCheckedChange={(checked) => {
                    const isSame = !!checked;
                    setWhatsAppSameAsMobile(isSame);
                    if (isSame) setFormData(prev => ({ ...prev, whatsAppNumber: prev.mobileNumber }));
                  }}
                  className="dark:border-slate-600 data-[state=checked]:dark:bg-slate-700"
                />
                <Label htmlFor="supplier-whatsapp-same" className="text-slate-700 dark:text-slate-300 cursor-pointer text-sm font-normal">
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
              disabled={editingSupplier ? !canEdit : !canCreate}
              className="bg-primary dark:bg-slate-700 dark:hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManager;
