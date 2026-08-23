'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteFile as apiDeleteFile } from '../api/file-client';
import { FileItem } from '../types';

export function useFileDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => apiDeleteFile(fileId),
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
