'use client';

import { useGoogleAuth } from '@/web/features/auth/hooks/useGoogleAuth';
import { Upload, LogOut, User, Cloud } from 'lucide-react';
import { useState, useRef } from 'react';

interface NavbarProps {
  onTriggerUpload?: () => void;
}

export function Navbar({ onTriggerUpload }: NavbarProps) {
  const { signOut } = useGoogleAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Title */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center">
          <Cloud className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-100 text-sm">KikoCloud</span>
      </div>

      {/* Center Spacer / Title */}
      <div className="hidden md:block">
        <span className="text-xs font-mono text-slate-400">AWS Lambda + MinIO Direct Flow</span>
      </div>

      {/* Right Actions: Upload Button + Profile */}
      <div className="flex items-center gap-3">
        {/* Global Upload Button */}
        <button
          onClick={onTriggerUpload}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all duration-200 active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              // Upload handler will capture
            }
          }}
        />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 hover:border-indigo-400 transition-colors"
          >
            <User className="w-4 h-4" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-40 text-xs">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="font-medium text-slate-200">Google Account</p>
                <p className="text-[10px] text-slate-400">User Session Active</p>
              </div>
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-rose-950/40 text-rose-400 font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
