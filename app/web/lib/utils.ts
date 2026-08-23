import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  FileCode,
  Archive,
  FileSpreadsheet,
  FileCheck,
  File as GenericFile,
} from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getFileIconInfo(contentType: string = '', fileName: string = '') {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return { icon: ImageIcon, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  }
  if (contentType.startsWith('video/') || ['mp4', 'webm', 'mkv', 'mov'].includes(ext)) {
    return { icon: Film, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
  }
  if (contentType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
    return { icon: Music, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
  }
  if (contentType.includes('pdf') || ext === 'pdf') {
    return { icon: FileText, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
  }
  if (
    contentType.includes('json') ||
    contentType.includes('javascript') ||
    contentType.includes('typescript') ||
    contentType.includes('html') ||
    contentType.includes('css') ||
    ['js', 'ts', 'tsx', 'jsx', 'json', 'py', 'go', 'rs', 'html', 'css'].includes(ext)
  ) {
    return { icon: FileCode, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  }
  if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext) || contentType.includes('zip')) {
    return { icon: Archive, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' };
  }
  if (['csv', 'xlsx', 'xls'].includes(ext) || contentType.includes('spreadsheet') || contentType.includes('excel')) {
    return { icon: FileSpreadsheet, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' };
  }
  if (['doc', 'docx', 'txt', 'md'].includes(ext)) {
    return { icon: FileCheck, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
  }

  return { icon: GenericFile, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
}
