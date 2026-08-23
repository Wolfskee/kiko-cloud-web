'use client';

import { useState, useRef } from 'react';
import { Sidebar } from '@/web/components/layout/Sidebar';
import { Navbar } from '@/web/components/layout/Navbar';
import { UploadDropzone } from '@/web/features/upload/components/UploadDropzone';
import { UploadFloatingTray } from '@/web/features/upload/components/UploadFloatingTray';
import { DuplicateConflictModal } from '@/web/features/upload/components/DuplicateConflictModal';
import { PreviewModal } from '@/web/features/preview/components/PreviewModal';
import { useDirectUpload } from '@/web/features/upload/hooks/useDirectUpload';
import { FileItem } from '@/web/features/files/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    tasks,
    uploadFiles,
    retryTask,
    removeTask,
    clearCompleted,
    activeConflict,
    handleRenameUpload,
    handleSkip,
  } = useDirectUpload();

  const [selectedPreviewFile, setSelectedPreviewFile] = useState<FileItem | null>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    hiddenFileInputRef.current?.click();
  };

  return (
    <UploadDropzone onDropFiles={uploadFiles}>
      <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Right Main Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onTriggerUpload={handleTriggerUpload} />

          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Hidden File Input for Global Upload Button */}
        <input
          ref={hiddenFileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              uploadFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        {/* Floating Upload Progress Tray */}
        <UploadFloatingTray
          tasks={tasks}
          onRetry={retryTask}
          onRemove={removeTask}
          onClearCompleted={clearCompleted}
        />

        {/* Duplicate Filename Conflict Prompt Modal */}
        <DuplicateConflictModal
          conflict={activeConflict}
          onRenameUpload={handleRenameUpload}
          onSkip={handleSkip}
        />

        {/* Preview Modal */}
        <PreviewModal
          file={selectedPreviewFile}
          onClose={() => setSelectedPreviewFile(null)}
        />
      </div>
    </UploadDropzone>
  );
}
