'use client';

import { useState, useEffect } from 'react';
import { FileItem } from '@/web/features/files/types';
import { requestDownloadUrl } from '@/web/features/files/api/file-client';
import { formatBytes, formatDate, getFileIconInfo } from '@/web/lib/utils';
import { X, Download, Link2, ExternalLink, Loader2 } from 'lucide-react';
import { useFileDownload } from '@/web/features/files/hooks/useFileDownload';

interface PreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
}

export function PreviewModal({ file, onClose }: PreviewModalProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const { download } = useFileDownload();

  const [prevFileId, setPrevFileId] = useState<string | null>(null);

  const currentFileId = file?.id ?? null;
  if (currentFileId !== prevFileId) {
    setPrevFileId(currentFileId);
    setDownloadUrl(null);
    setBlobUrl(null);
    setTextContent(null);
    setIsLoadingUrl(Boolean(file));
  }

  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    let createdUrl: string | null = null;

    requestDownloadUrl(file.id)
      .then(async (url) => {
        if (!isMounted || !url) return;
        setDownloadUrl(url);

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isPdf = file.contentType.includes('pdf') || ext === 'pdf';
        const isText =
          file.contentType.includes('text') ||
          file.contentType.includes('json') ||
          ['txt', 'md', 'json', 'js', 'ts', 'py'].includes(ext);

        try {
          // Fetch raw Blob to override MinIO Content-Disposition: attachment for inline preview
          const res = await fetch(url);
          if (res.ok) {
            if (isText) {
              const text = await res.text();
              if (isMounted) setTextContent(text.slice(0, 50000));
            } else {
              const blob = await res.blob();
              // Force pdf mime type on blob if pdf
              const finalBlob = isPdf ? new Blob([blob], { type: 'application/pdf' }) : blob;
              createdUrl = URL.createObjectURL(finalBlob);
              if (isMounted) setBlobUrl(createdUrl);
            }
          }
        } catch (fetchErr) {
          console.warn('Blob fetch failed, falling back to direct URL:', fetchErr);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setIsLoadingUrl(false);
      });

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [file]);

  if (!file) return null;

  const { icon: Icon, color } = getFileIconInfo(file.contentType, file.name);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const isImage = file.contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  const isVideo = file.contentType.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext);
  const isAudio = file.contentType.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(ext);
  const isPdf = file.contentType.includes('pdf') || ext === 'pdf';
  const activeUrl = blobUrl || downloadUrl;

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/web?preview=${file.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${color} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-100 text-sm sm:text-base truncate">{file.name}</h2>
              <p className="text-xs text-slate-400 font-mono">
                {formatBytes(file.size)} • Created {formatDate(file.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy link"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => download(file.id, file.name)}
              title="Download file"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold px-3"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Preview Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center min-h-[350px] bg-slate-950/40">
          {isLoadingUrl ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="text-xs">Loading file preview...</span>
            </div>
          ) : isPdf && activeUrl ? (
            <object
              data={activeUrl}
              type="application/pdf"
              className="w-full h-[65vh] rounded-2xl border border-slate-800 shadow-xl"
            >
              <iframe
                src={activeUrl}
                className="w-full h-[65vh] rounded-2xl border border-slate-800"
                title={file.name}
              />
            </object>
          ) : textContent !== null ? (
            <div className="w-full h-[60vh] bg-slate-950 rounded-2xl p-4 border border-slate-800 overflow-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {textContent}
            </div>
          ) : isImage && activeUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={activeUrl}
              alt={file.name}
              className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-xl border border-slate-800"
            />
          ) : isVideo && activeUrl ? (
            <video
              src={activeUrl}
              controls
              autoPlay
              className="max-h-[60vh] max-w-full rounded-2xl shadow-xl border border-slate-800"
            />
          ) : isAudio && activeUrl ? (
            <div className="w-full max-w-md p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl">
              <Icon className="w-12 h-12 text-purple-400 mx-auto" />
              <audio src={activeUrl} controls className="w-full" />
            </div>
          ) : (
            <div className="text-center p-8 space-y-3 max-w-sm">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${color} mx-auto`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-200 text-sm">Preview not directly supported</h3>
              <p className="text-xs text-slate-400">
                You can download the file or open it directly in an external viewer.
              </p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open External Link
                </a>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {copied && (
          <div className="bg-emerald-500/20 text-emerald-300 border-t border-emerald-500/30 px-4 py-2 text-xs font-semibold text-center">
            File share link copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}
