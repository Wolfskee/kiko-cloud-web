'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { requestUploadTicket, confirmCallback } from '@/web/features/files/api/file-client';
import { FileItem } from '@/web/features/files/types';
import { UploadTask } from '../types';
import { ConflictItem } from '../components/DuplicateConflictModal';

export function useDirectUpload() {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [conflictsQueue, setConflictsQueue] = useState<ConflictItem[]>([]);
  const queryClient = useQueryClient();

  const updateTask = (taskId: string, patch: Partial<UploadTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
    );
  };

  const processUpload = async (task: UploadTask) => {
    const { id: taskId, file } = task;

    try {
      // Step 1: Request Ticket via BFF
      updateTask(taskId, { status: 'REQUESTING_TICKET', progress: 5 });
      console.log('[Upload Lifecycle Step 1] Requesting ticket for:', file.name, 'Size:', file.size);

      const { fileId, uploadUrl, objectKey } = await requestUploadTicket({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || 'application/octet-stream',
      });

      console.log('[Upload Lifecycle Step 1 Result]', { fileId, uploadUrl, objectKey });
      updateTask(taskId, { fileId, uploadUrl, status: 'UPLOADING', progress: 10 });

      // Step 2: Axios PUT Direct Upload to MinIO uploadUrl
      let lastTime = Date.now();
      let lastLoaded = 0;

      console.log('[Upload Lifecycle Step 2] Initiating direct Axios PUT to MinIO:', uploadUrl);

      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size || 1;
          const loaded = progressEvent.loaded;
          const percent = Math.min(95, Math.round((loaded * 90) / total) + 10);

          const currentTime = Date.now();
          const timeDiff = (currentTime - lastTime) / 1000;
          if (timeDiff >= 0.5) {
            const bytesDiff = loaded - lastLoaded;
            const speedBps = bytesDiff / timeDiff;
            lastTime = currentTime;
            lastLoaded = loaded;
            updateTask(taskId, { progress: percent, bytesUploaded: loaded, totalBytes: total, speedBps });
          } else {
            updateTask(taskId, { progress: percent, bytesUploaded: loaded, totalBytes: total });
          }
        },
      });

      console.log('[Upload Lifecycle Step 2 Success] Binary stream uploaded to MinIO via Axios');

      // Step 3: Short delay (1s) to allow MinIO storage index flush before Lambda HeadObject check
      updateTask(taskId, { status: 'CONFIRMING', progress: 98 });
      console.log('[Upload Lifecycle Step 3] Waiting 1s for MinIO flush before confirmation...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Callback Confirmation with automatic retry
      let confirmAttempts = 0;
      let confirmed = false;

      while (confirmAttempts < 3 && !confirmed) {
        try {
          confirmAttempts++;
          console.log(`[Upload Lifecycle Step 3 Attempt ${confirmAttempts}] Confirming fileId:`, fileId, 'objectKey:', objectKey);
          await confirmCallback(fileId, objectKey);
          confirmed = true;
        } catch (confirmErr) {
          if (confirmAttempts >= 3) throw confirmErr;
          console.warn(`[Upload Lifecycle Step 3 Attempt ${confirmAttempts} failed, retrying in 1.5s...]`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      // Step 5: Success & Refresh Query List
      console.log('[Upload Lifecycle Step 5] Complete! Refreshing file list...');
      updateTask(taskId, { status: 'SUCCESS', progress: 100 });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('[Upload Lifecycle Error]', err);
      updateTask(taskId, { status: 'ERROR', error: errorMessage });
    }
  };

  const startTaskForFile = (file: File) => {
    const newTask: UploadTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      file,
      status: 'QUEUED',
      progress: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
    };
    setTasks((prev) => [...prev, newTask]);
    processUpload(newTask);
  };

  const uploadFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const existingFiles = (queryClient.getQueryData<FileItem[]>(['files']) || []);
      const conflicts: ConflictItem[] = [];
      const safeFiles: File[] = [];

      fileArray.forEach((file) => {
        const match = existingFiles.find((ef) => ef.name.toLowerCase() === file.name.toLowerCase());
        if (match) {
          conflicts.push({ file, existingFile: match });
        } else {
          safeFiles.push(file);
        }
      });

      // Start uploading non-conflicting files
      safeFiles.forEach(startTaskForFile);

      // Queue conflicts for modal prompt
      if (conflicts.length > 0) {
        setConflictsQueue((prev) => [...prev, ...conflicts]);
      }
    },
    [queryClient]
  );

  const activeConflict = conflictsQueue.length > 0 ? conflictsQueue[0] : null;

  const handleRenameUpload = (renamedFile: File) => {
    setConflictsQueue((prev) => prev.slice(1));
    startTaskForFile(renamedFile);
  };

  const handleSkip = () => {
    setConflictsQueue((prev) => prev.slice(1));
  };

  const retryTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (target) {
        const resetTask: UploadTask = {
          ...target,
          status: 'QUEUED',
          progress: 0,
          error: undefined,
        };
        processUpload(resetTask);
      }
      return prev;
    });
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.status !== 'SUCCESS'));
  }, []);

  return {
    tasks,
    uploadFiles,
    retryTask,
    removeTask,
    clearCompleted,
    hasActiveUploads: tasks.some((t) => ['QUEUED', 'REQUESTING_TICKET', 'UPLOADING', 'CONFIRMING'].includes(t.status)),
    activeConflict,
    handleRenameUpload,
    handleSkip,
  };
}
