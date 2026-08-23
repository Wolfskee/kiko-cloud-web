'use client';

import { useState } from 'react';
import { UploadTask } from '../types';
import { formatBytes } from '@/web/lib/utils';
import {
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Upload,
} from 'lucide-react';

interface UploadFloatingTrayProps {
  tasks: UploadTask[];
  onRetry: (taskId: string) => void;
  onRemove: (taskId: string) => void;
  onClearCompleted: () => void;
}

export function UploadFloatingTray({
  tasks,
  onRetry,
  onRemove,
  onClearCompleted,
}: UploadFloatingTrayProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (tasks.length === 0) return null;

  const completedCount = tasks.filter((t) => t.status === 'SUCCESS').length;
  const errorCount = tasks.filter((t) => t.status === 'ERROR').length;
  const activeCount = tasks.length - completedCount - errorCount;

  return (
    <div className="fixed bottom-5 right-5 z-40 w-96 max-w-[calc(100vw-2.5rem)] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Tray Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-xs text-slate-200">
            {activeCount > 0
              ? `Uploading ${activeCount} file${activeCount > 1 ? 's' : ''}`
              : completedCount === tasks.length
              ? `All ${completedCount} upload${completedCount > 1 ? 's' : ''} complete`
              : `${completedCount} uploaded, ${errorCount} failed`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onClearCompleted}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close Completed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tray Body List */}
      {!isMinimized && (
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
          {tasks.map((task) => {
            const isUploading = ['QUEUED', 'REQUESTING_TICKET', 'UPLOADING', 'CONFIRMING'].includes(
              task.status
            );
            const isSuccess = task.status === 'SUCCESS';
            const isError = task.status === 'ERROR';

            return (
              <div
                key={task.id}
                className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/40 transition-colors space-y-1.5"
              >
                {/* File info row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-200 truncate">{task.file.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatBytes(task.bytesUploaded)} / {formatBytes(task.totalBytes)}
                      {task.speedBps && isUploading
                        ? ` • ${formatBytes(task.speedBps)}/s`
                        : ''}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isUploading && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
                    {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isError && (
                      <button
                        onClick={() => onRetry(task.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                        title="Retry upload"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemove(task.id)}
                      className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      isError
                        ? 'bg-rose-500'
                        : isSuccess
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                {isError && (
                  <div className="flex items-center gap-1 text-[10px] text-rose-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>{task.error || 'Upload failed'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
