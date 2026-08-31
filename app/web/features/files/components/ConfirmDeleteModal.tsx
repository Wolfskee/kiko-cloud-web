'use client';

import { FileItem } from '../types';
import { formatBytes, getFileIconInfo } from '@/web/lib/utils';
import { AlertTriangle, X, Loader2, Trash2, RotateCcw, Info } from 'lucide-react';

interface ConfirmDeleteModalProps {
  file: FileItem | null;
  mode?: 'soft' | 'permanent';
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  file,
  mode = 'permanent',
  isPending = false,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!file) return null;

  const { icon: Icon, color } = getFileIconInfo(file.contentType, file.name);
  const isSoftDelete = mode === 'soft';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning / Notice Badge & Icon */}
        <div className="flex items-center gap-3">
          {isSoftDelete ? (
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              {isSoftDelete ? 'Move file to Trash?' : 'Permanently delete file?'}
            </h2>
            <p className={`text-xs font-medium ${isSoftDelete ? 'text-amber-400/90' : 'text-rose-400/90'}`}>
              {isSoftDelete ? 'Can be restored from Trash anytime.' : 'This action cannot be undone.'}
            </p>
          </div>
        </div>

        {/* File Card Summary */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${color} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-200 text-xs truncate">{file.name}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatBytes(file.size)}</p>
          </div>
        </div>

        {/* Description & Restore Notice */}
        {isSoftDelete ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              This file will be moved to your Trash bin.
            </p>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
              <RotateCcw className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Tip:</strong> You can view and restore this file anytime from the <strong>Trash</strong> page in the sidebar.
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 leading-relaxed">
            The file will be permanently removed from KikoCloud storage and cannot be restored later.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {isSoftDelete ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Moving...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Move to Trash</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Delete</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
