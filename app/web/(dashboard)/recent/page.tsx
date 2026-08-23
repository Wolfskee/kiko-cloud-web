'use client';

import { useState } from 'react';
import { FileExplorer } from '@/web/features/files/components/FileExplorer';
import { PreviewModal } from '@/web/features/preview/components/PreviewModal';
import { FileItem } from '@/web/features/files/types';

export default function RecentFilesPage() {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  return (
    <div className="w-full">
      <FileExplorer
        category="recent"
        title="Recent Files"
        subtitle="Files uploaded or modified in the last 7 days"
        onSelectPreview={(file) => setPreviewFile(file)}
      />

      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
