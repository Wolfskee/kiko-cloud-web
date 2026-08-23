export type UploadStatus =
  | 'QUEUED'
  | 'REQUESTING_TICKET'
  | 'UPLOADING'
  | 'CONFIRMING'
  | 'SUCCESS'
  | 'ERROR';

export interface UploadTask {
  id: string; // unique local task id
  file: File;
  fileId?: string;
  uploadUrl?: string;
  status: UploadStatus;
  progress: number; // 0 to 100
  bytesUploaded: number;
  totalBytes: number;
  speedBps?: number; // bytes per second
  error?: string;
}
