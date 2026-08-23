'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFiles } from '../api/file-client';
import { FileCategory, FileItem } from '../types';

export function useFileList(category: FileCategory = 'all', searchQuery: string = '') {
  const query = useQuery<FileItem[]>({
    queryKey: ['files'],
    queryFn: fetchFiles,
  });

  const files = query.data || [];

  const filteredFiles = files.filter((file) => {
    // Search query matching
    const matchesSearch = searchQuery.trim() === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (category === 'recent') {
      const now = new Date().getTime();
      const created = new Date(file.createdAt).getTime();
      const isRecent = (now - created) < (86400000 * 7); // within 7 days
      return isRecent && file.status !== 'deleted';
    }

    if (category === 'trash') {
      return file.status === 'deleted';
    }

    // Default 'all'
    return file.status !== 'deleted';
  });

  return {
    ...query,
    files: filteredFiles,
    totalCount: files.length,
    totalStorageUsed: files.reduce((acc, curr) => acc + (curr.size || 0), 0),
  };
}
