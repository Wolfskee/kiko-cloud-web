'use client';

import { useState } from 'react';
import { FileExplorer } from '@/web/features/files/components/FileExplorer';
import { PreviewModal } from '@/web/features/preview/components/PreviewModal';
import { FileItem } from '@/web/features/files/types';

export default function MyFilesPage() {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  return (
    <div className="w-full">
      <FileExplorer
        category="all"
        title="All Files"
        subtitle="Serverless direct-upload files powered by AWS Lambda and MinIO"
        onSelectPreview={(file) => setPreviewFile(file)}
      />

      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
