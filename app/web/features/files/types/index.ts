export interface FileItem {
  id: string;
  name: string;
  size: number;
  contentType: string;
  status: 'active' | 'pending' | 'deleted' | string;
  createdAt: string;
  updatedAt: string;
}

export type FileViewMode = 'table' | 'grid';
export type FileCategory = 'all' | 'recent' | 'trash';
