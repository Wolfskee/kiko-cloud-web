'use client';

import { FileItem } from '@/web/features/files/types';
import { formatBytes } from '@/web/lib/utils';
import { AlertTriangle, Copy, X } from 'lucide-react';

export interface ConflictItem {
  file: File;
  existingFile: FileItem;
}

interface DuplicateConflictModalProps {
  conflict: ConflictItem | null;
  onRenameUpload: (file: File) => void;
  onSkip: () => void;
}

export function DuplicateConflictModal({
  conflict,
  onRenameUpload,
  onSkip,
}: DuplicateConflictModalProps) {
  if (!conflict) return null;

  const { file, existingFile } = conflict;

  // Auto generate renamed file name like "file (1).ext"
  const generateRenamedFile = (originalFile: File): File => {
    const parts = originalFile.name.split('.');
    const ext = parts.length > 1 ? `.${parts.pop()}` : '';
    const baseName = parts.join('.');
    const newName = `${baseName} (1)${ext}`;
    return new File([originalFile], newName, { type: originalFile.type });
  };

  const renamedFile = generateRenamedFile(file);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Duplicate File Name</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              A file named <span className="font-semibold text-slate-200">{file.name}</span> already exists in your cloud drive.
            </p>
          </div>
        </div>

        {/* File Comparison Card */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>New File Size:</span>
            <span className="font-mono text-slate-200">{formatBytes(file.size)}</span>
          </div>
          <div className="border-t border-slate-800/80 pt-2 flex justify-between items-center text-slate-400">
            <span>Existing File Size:</span>
            <span className="font-mono text-slate-200">{formatBytes(existingFile.size)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Auto Rename Upload */}
          <button
            onClick={() => onRenameUpload(renamedFile)}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>{`Rename & Upload as "${renamedFile.name}"`}</span>
          </button>

          {/* Skip / Cancel */}
          <button
            onClick={onSkip}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 font-medium text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>Skip Upload</span>
          </button>
        </div>
      </div>
    </div>
  );
}
