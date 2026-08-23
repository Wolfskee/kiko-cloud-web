'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StorageCapacityBar } from './StorageCapacityBar';
import { Cloud, Folder, Clock, Trash2, Shield } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'All Files', href: '/web', icon: Folder },
    { label: 'Recent', href: '/web/recent', icon: Clock },
    { label: 'Trash', href: '/web/trash', icon: Trash2 },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 p-5 flex flex-col justify-between h-screen sticky top-0 shrink-0 hidden md:flex">
      {/* Brand & Navigation */}
      <div className="space-y-8">
        {/* Brand Header */}
        <Link href="/web" className="flex items-center gap-3 px-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-lg leading-none tracking-tight">KikoCloud</h2>
            <span className="text-[10px] text-slate-400 font-mono">BFF Direct Upload</span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Storage Quota & Footer Info */}
      <div className="space-y-4">
        <StorageCapacityBar />
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> MinIO Edge Node
          </span>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
