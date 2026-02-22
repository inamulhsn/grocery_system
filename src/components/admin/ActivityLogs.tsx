"use client";

import React, { useState } from 'react';
import { History, User, Clock, Info, Tag, ShoppingBag, Settings, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActivityLog } from '@/types/grocery';
import { showSuccess, showError } from '@/utils/toast';

interface ActivityLogsProps {
  logs: ActivityLog[];
  onRevertLog?: (id: number) => Promise<void>;
}

const ActivityLogs = ({ logs, onRevertLog }: ActivityLogsProps) => {
  const [revertingId, setRevertingId] = useState<number | null>(null);

  const handleRevert = async (log: ActivityLog) => {
    if (!onRevertLog) return;
    if (!confirm(`Revert (undo) this action?\n"${log.action}: ${log.details}"`)) return;
    setRevertingId(log.id);
    try {
      await onRevertLog(log.id);
      showSuccess('Log entry reverted.');
    } catch {
      showError('Failed to revert log.');
    } finally {
      setRevertingId(null);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('PRODUCT')) return <Tag size={16} className="text-blue-500" />;
    if (action.includes('SALE')) return <ShoppingBag size={16} className="text-green-500" />;
    if (action.includes('USER')) return <User size={16} className="text-purple-500" />;
    if (action.includes('BRANDING')) return <Settings size={16} className="text-orange-500" />;
    return <Info size={16} className="text-slate-400" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    if (action.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    if (action.includes('UPDATE')) return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    if (action.includes('SALE')) return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border border-slate-200 dark:border-slate-800 text-center">
        <History size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Activity Recorded</h2>
        <p className="text-slate-500 dark:text-slate-400">User actions will appear here as they happen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">System Activity Logs</h2>
          <p className="text-slate-500 dark:text-slate-400">Audit trail of all user actions and system changes</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Last 100 Actions
        </Badge>
      </div>

      <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Details</th>
                {onRevertLog && <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                      <span className="text-sm font-medium">
                        {new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                        {log.userName?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`capitalize font-bold border ${getActionColor(log.action)}`}>
                      <div className="flex items-center gap-1.5">
                        {getActionIcon(log.action)}
                        {log.action.replace('_', ' ')}
                      </div>
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{log.details}</p>
                    {log.revertedAt && (
                      <span className="inline-block mt-1 text-xs text-slate-400 dark:text-slate-500">Reverted {new Date(log.revertedAt).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}</span>
                    )}
                  </td>
                  {onRevertLog && (
                    <td className="px-6 py-4 text-right">
                      {log.revertedAt ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Reverted</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20"
                          onClick={() => handleRevert(log)}
                          disabled={revertingId === log.id}
                        >
                          <RotateCcw size={14} className="mr-1" />
                          {revertingId === log.id ? 'Reverting…' : 'Revert'}
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ActivityLogs;