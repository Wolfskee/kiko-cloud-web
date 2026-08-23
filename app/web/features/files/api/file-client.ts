import { FileItem } from '../types';

export async function fetchFiles(): Promise<FileItem[]> {
  const res = await fetch('/api/files', { cache: 'no-store' });
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
  const res = await fetch('/api/files/upload-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to request upload ticket');
  }
  return res.json();
}

export async function confirmCallback(fileId: string, objectKey?: string): Promise<void> {
  const res = await fetch('/api/files/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, objectKey }),
  });
  if (!res.ok) {
    throw new Error('Failed to confirm upload callback');
  }
}

export async function requestDownloadUrl(fileId: string): Promise<string> {
  const res = await fetch(`/api/files/${fileId}/download-url`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch download URL');
  }
  const data = await res.json();
  return data.downloadUrl || '';
}

export async function deleteFile(fileId: string): Promise<void> {
  const res = await fetch(`/api/files/${fileId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete file');
  }
}
