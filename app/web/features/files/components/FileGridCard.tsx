'use client';

import { FileCategory, FileItem } from '../types';
import { getFileIconInfo, formatBytes, formatDate } from '@/web/lib/utils';
import { useFileDownload } from '../hooks/useFileDownload';
import { useFileDelete } from '../hooks/useFileDelete';
import { useFilePermanentDelete } from '../hooks/useFilePermanentDelete';
import { useFileRestore } from '../hooks/useFileRestore';
import { Download, Trash2, Eye, Link2, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface FileGridCardProps {
  file: FileItem;
  category?: FileCategory;
  onSelectPreview: (file: FileItem) => void;
  onRequestDelete?: (file: FileItem) => void;
  onRequestPermanentDelete?: (file: FileItem) => void;
}

export function FileGridCard({
  file,
  category,
  onSelectPreview,
  onRequestDelete,
  onRequestPermanentDelete,
}: FileGridCardProps) {
  const { icon: Icon, color } = getFileIconInfo(file.contentType, file.name);
  const { download, downloadingId } = useFileDownload();
  const deleteMutation = useFileDelete();
  const permanentDeleteMutation = useFilePermanentDelete();
  const restoreMutation = useFileRestore();
  const [copied, setCopied] = useState(false);

  const isTrash = category === 'trash';
  const isDownloading = downloadingId === file.id;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}/web?preview=${file.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrashDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequestPermanentDelete) {
      onRequestPermanentDelete(file);
    } else {
      permanentDeleteMutation.mutate(file.id);
    }
  };

  const handleSoftDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequestDelete) {
      onRequestDelete(file);
    } else {
      deleteMutation.mutate(file.id);
    }
  };

  return (
    <div
      onClick={() => onSelectPreview(file)}
      className="group relative bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
    >
      {/* File Card Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectPreview(file);
            }}
            title="Preview"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {isTrash ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                restoreMutation.mutate(file.id);
              }}
              disabled={restoreMutation.isPending}
              title="Restore File"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 transition-colors disabled:opacity-50"
            >
              {restoreMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                download(file.id, file.name);
              }}
              disabled={isDownloading}
              title="Download"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Share"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700/60 transition-colors"
          >
            <Link2 className="w-4 h-4" />
          </button>

          {isTrash ? (
            <button
              onClick={handleTrashDeleteClick}
              disabled={permanentDeleteMutation.isPending}
              title="Delete Permanently"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors disabled:opacity-50"
            >
              {permanentDeleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              onClick={handleSoftDeleteClick}
              disabled={deleteMutation.isPending}
              title="Delete"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* File Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-slate-100 text-sm truncate group-hover:text-indigo-300 transition-colors">
          {file.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>

      {copied && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded shadow-md">
          Copied!
        </span>
      )}
    </div>
  );
}
