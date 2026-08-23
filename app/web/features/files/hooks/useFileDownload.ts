'use client';

import { useState } from 'react';
import { requestDownloadUrl } from '../api/file-client';

export function useFileDownload() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = async (fileId: string, fileName: string) => {
    try {
      setDownloadingId(fileId);
      const url = await requestDownloadUrl(fileId);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return { download, downloadingId };
}
