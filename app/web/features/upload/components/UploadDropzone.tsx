'use client';

import { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadDropzoneProps {
  onDropFiles: (files: FileList) => void;
  children: React.ReactNode;
}

export function UploadDropzone({ onDropFiles, children }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter = 0;

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        onDropFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onDropFiles]);

  return (
    <div className="relative min-h-screen">
      {children}

      {/* Drag & Drop Fullscreen Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-indigo-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 border-4 border-dashed border-indigo-400 m-4 rounded-3xl pointer-events-none animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 mb-4 animate-bounce">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Drop files here to Upload</h2>
          <p className="text-sm text-indigo-200 mt-1 font-mono">
            Direct MinIO Acceleration • Automatic Ticket & Callback
          </p>
        </div>
      )}
    </div>
  );
}
