'use client';

import { FileItem } from '../types';
import { getFileIconInfo, formatBytes, formatDate } from '@/web/lib/utils';
import { useFileDownload } from '../hooks/useFileDownload';
import { useFileDelete } from '../hooks/useFileDelete';
import { Download, Trash2, Eye, Link2, MoreVertical, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface FileTableProps {
  files: FileItem[];
  onSelectPreview: (file: FileItem) => void;
}

export function FileTable({ files, onSelectPreview }: FileTableProps) {
  const { download, downloadingId } = useFileDownload();
  const deleteMutation = useFileDelete();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  const handleCopyLink = async (file: FileItem) => {
    try {
      const shareUrl = `${window.location.origin}/web?preview=${file.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md min-h-[280px] pb-24">
      <table className="w-full text-left text-sm text-slate-300 border-collapse">
        <thead className="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-4 px-6">Name</th>
            <th className="py-4 px-4 hidden sm:table-cell">Size</th>
            <th className="py-4 px-4 hidden md:table-cell">Type</th>
            <th className="py-4 px-4 hidden lg:table-cell">Date Modified</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {files.map((file, index) => {
            const { icon: Icon, color } = getFileIconInfo(file.contentType, file.name);
            const isDownloading = downloadingId === file.id;

            // Row 0 ALWAYS pops DOWNWARDS to prevent clipping by the top table header
            // Only rows at the bottom (index > 0) pop UPWARDS
            const isNearBottom = index > 0 && index >= files.length - 2 && files.length >= 3;

            return (
              <tr
                key={file.id}
                className="group hover:bg-slate-800/40 transition-colors duration-150"
              >
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => onSelectPreview(file)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${color} shrink-0 cursor-pointer hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p
                        onClick={() => onSelectPreview(file)}
                        className="font-medium text-slate-100 truncate cursor-pointer hover:text-indigo-400 transition-colors"
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 sm:hidden">
                        {formatBytes(file.size)} • {formatDate(file.createdAt)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 hidden sm:table-cell text-slate-400 font-mono text-xs">
                  {formatBytes(file.size)}
                </td>
                <td className="py-3.5 px-4 hidden md:table-cell text-slate-400 text-xs truncate max-w-[140px]">
                  {file.contentType}
                </td>
                <td className="py-3.5 px-4 hidden lg:table-cell text-slate-400 text-xs">
                  {formatDate(file.createdAt)}
                </td>
                <td className="py-3.5 px-6 text-right relative">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSelectPreview(file)}
                      title="Preview File"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => download(file.id, file.name)}
                      disabled={isDownloading}
                      title="Download File"
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyLink(file)}
                      title="Copy Share Link"
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>

                    <div className="relative" ref={activeMenuId === file.id ? menuRef : undefined}>
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === file.id ? null : file.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === file.id && (
                        <div
                          className={`absolute right-0 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 text-left text-xs ${
                            isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                          }`}
                        >
                          <button
                            onClick={() => {
                              onSelectPreview(file);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-800 text-slate-300"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" /> Preview
                          </button>
                          <button
                            onClick={() => {
                              download(file.id, file.name);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-800 text-slate-300"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400" /> Download
                          </button>
                          <button
                            onClick={() => {
                              handleCopyLink(file);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-800 text-slate-300"
                          >
                            <Link2 className="w-3.5 h-3.5 text-slate-400" /> Copy Link
                          </button>
                          <div className="my-1 border-t border-slate-800" />
                          <button
                            onClick={() => {
                              deleteMutation.mutate(file.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-rose-950/40 text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {copiedId === file.id && (
                    <span className="absolute right-12 bottom-full mb-1 px-2.5 py-1 bg-emerald-500 text-slate-950 font-semibold text-[10px] rounded-md shadow-lg animate-fade-in z-50">
                      Link Copied!
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
