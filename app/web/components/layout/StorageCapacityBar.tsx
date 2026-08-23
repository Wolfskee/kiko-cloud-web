'use client';

import { useFileList } from '@/web/features/files/hooks/useFileList';
import { formatBytes } from '@/web/lib/utils';
import { HardDrive } from 'lucide-react';

export function StorageCapacityBar() {
  const { totalStorageUsed } = useFileList('all');
  const MAX_STORAGE = 10 * 1024 * 1024 * 1024; // 10 GB
  const percentage = Math.min(100, Math.round((totalStorageUsed / MAX_STORAGE) * 100));

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <span>Storage</span>
        </div>
        <span className="text-[11px] font-mono text-indigo-400 font-semibold">{percentage}%</span>
      </div>

      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(4, percentage)}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-400">
        {formatBytes(totalStorageUsed)} of {formatBytes(MAX_STORAGE)} used
      </p>
    </div>
  );
}
