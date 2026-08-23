'use client';

import { useState } from 'react';
import { useFileList } from '../hooks/useFileList';
import { FileCategory, FileItem, FileViewMode } from '../types';
import { FileTable } from './FileTable';
import { FileGridCard } from './FileGridCard';
import { LayoutGrid, List, Search, FolderOpen, Loader2, Sparkles } from 'lucide-react';

interface FileExplorerProps {
  category?: FileCategory;
  title?: string;
  subtitle?: string;
  onSelectPreview: (file: FileItem) => void;
}

export function FileExplorer({
  category = 'all',
  title = 'My Files',
  subtitle = 'Manage, preview and direct-upload your cloud files',
  onSelectPreview,
}: FileExplorerProps) {
  const [viewMode, setViewMode] = useState<FileViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const { files, isLoading, isError } = useFileList(category, searchQuery);

  return (
    <div className="w-full space-y-6">
      {/* Explorer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{title}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {files.length} items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        {/* Toolbar: Search + View Switcher */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Table / Grid Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-300">Loading files from KikoCloud BFF...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 bg-rose-950/20 rounded-2xl border border-rose-900/30 text-rose-300 text-center p-6">
          <p className="font-semibold text-sm mb-1">Failed to load files</p>
          <p className="text-xs text-rose-400">Please check your connection or environment settings.</p>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/80 border-dashed text-center p-6 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-bold text-slate-200">No files found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? `No items matched "${searchQuery}"`
                : 'Drag and drop files anywhere on the page or click Upload to get started.'}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            <Sparkles className="w-3 h-3" /> MinIO Direct Upload Ready
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <FileTable files={files} onSelectPreview={onSelectPreview} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <FileGridCard key={file.id} file={file} onSelectPreview={onSelectPreview} />
          ))}
        </div>
      )}
    </div>
  );
}
