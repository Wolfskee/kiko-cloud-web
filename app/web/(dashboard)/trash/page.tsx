'use client';

import { useState } from 'react';
import { FileExplorer } from '@/web/features/files/components/FileExplorer';
import { PreviewModal } from '@/web/features/preview/components/PreviewModal';
import { FileItem } from '@/web/features/files/types';

export default function TrashFilesPage() {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  return (
    <div className="w-full">
      <FileExplorer
        category="trash"
        title="Trash"
        subtitle="Deleted files ready for permanent removal or recovery"
        onSelectPreview={(file) => setPreviewFile(file)}
      />

      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
