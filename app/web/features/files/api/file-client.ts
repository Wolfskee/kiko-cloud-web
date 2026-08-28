import { createBrowserClient } from '@supabase/ssr';
import { FileItem } from '../types';

async function getBrowserAuthHeader(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {};

  // Security Hardening: Purge any legacy token from localStorage to prevent XSS leaks
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth-token') || key.startsWith('sb-'))) {
        localStorage.removeItem(key);
      }
    }
  } catch {}

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ghpyfaegcjxfpufilxbh.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1Gb2J5xRDZe89zwTNk2lPQ_62rQtMc5';
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch (err) {
    console.warn('Failed to retrieve browser Supabase session:', err);
  }
  return {};
}

export async function fetchFiles(): Promise<FileItem[]> {
  const authHeaders = await getBrowserAuthHeader();
  const res = await fetch('/api/files', {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch files');
  }
  const data = await res.json();
  return data.files || [];
}

export async function requestUploadTicket(payload: {
  fileName: string;
  fileSize: number;
  contentType: string;
}): Promise<{ fileId: string; uploadUrl: string; objectKey?: string }> {
  const authHeaders = await getBrowserAuthHeader();
  const res = await fetch('/api/files/upload-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to request upload ticket');
  }
  return res.json();
}

export async function confirmCallback(fileId: string, objectKey?: string): Promise<void> {
  const authHeaders = await getBrowserAuthHeader();
  const res = await fetch('/api/files/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ fileId, objectKey }),
  });
  if (!res.ok) {
    throw new Error('Failed to confirm upload callback');
  }
}

export async function requestDownloadUrl(fileId: string): Promise<string> {
  const authHeaders = await getBrowserAuthHeader();
  const res = await fetch(`/api/files/${fileId}/download-url`, {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch download URL');
  }
  const data = await res.json();
  return data.downloadUrl || '';
}

export async function deleteFile(fileId: string): Promise<void> {
  const authHeaders = await getBrowserAuthHeader();
  const res = await fetch(`/api/files/${fileId}`, {
    method: 'DELETE',
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    throw new Error('Failed to delete file');
  }
}
