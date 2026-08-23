export interface RawGoFile {
  id?: string;
  file_id?: string;
  user_id?: string;
  userId?: string;
  original_name?: string;
  name?: string;
  size_bytes?: number;
  file_size?: number;
  size?: number;
  content_type?: string;
  contentType?: string;
  object_key?: string;
  bucket?: string;
  e_tag?: string;
  status?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface FileDTO {
  id: string;
  name: string;
  size: number;
  contentType: string;
  status: 'active' | 'pending' | 'deleted' | string;
  createdAt: string;
  updatedAt: string;
}

export interface RawTicketResponse {
  file_id?: string;
  fileId?: string;
  id?: string;
  upload_url?: string;
  uploadUrl?: string;
  object_key?: string;
  objectKey?: string;
  key?: string;
  [key: string]: unknown;
}

export interface UploadTicketDTO {
  fileId: string;
  uploadUrl: string;
  objectKey?: string;
}

export function mapFileToDTO(raw: RawGoFile): FileDTO {
  return {
    id: raw.id || raw.file_id || 'unknown-id',
    name: raw.original_name || raw.name || 'Untitled',
    size: raw.size_bytes ?? raw.file_size ?? raw.size ?? 0,
    contentType: raw.content_type || raw.contentType || 'application/octet-stream',
    status: (raw.status || 'ACTIVE').toLowerCase(),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export function mapFileListToDTO(raw: unknown): FileDTO[] {
  let list: RawGoFile[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.files)) {
      list = obj.files as RawGoFile[];
    } else if (Array.isArray(obj.data)) {
      list = obj.data as RawGoFile[];
    }
  }
  return list.map(mapFileToDTO);
}

export function mapTicketToDTO(raw: unknown): UploadTicketDTO {
  let target = raw as Record<string, unknown>;
  if (target && typeof target === 'object') {
    if (target.data && typeof target.data === 'object') {
      target = target.data as Record<string, unknown>;
    } else if (target.ticket && typeof target.ticket === 'object') {
      target = target.ticket as Record<string, unknown>;
    }
  }
  target = target || {};

  return {
    fileId: String(target.id || target.file_id || target.fileId || ''),
    uploadUrl: String(target.upload_url || target.uploadUrl || target.url || ''),
    objectKey: target.object_key || target.objectKey || target.key ? String(target.object_key || target.objectKey || target.key) : undefined,
  };
}
