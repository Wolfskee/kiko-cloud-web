'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restoreFile as apiRestoreFile } from '../api/file-client';
import { FileItem } from '../types';

export function useFileRestore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => apiRestoreFile(fileId),
    onMutate: async (fileId: string) => {
      await queryClient.cancelQueries({ queryKey: ['files'] });
      const previousFiles = queryClient.getQueryData<FileItem[]>(['files']);

      if (previousFiles) {
        queryClient.setQueryData<FileItem[]>(
          ['files'],
          previousFiles.filter((file) => file.id !== fileId)
        );
      }

      return { previousFiles };
    },
    onError: (_err, _fileId, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData(['files'], context.previousFiles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}
