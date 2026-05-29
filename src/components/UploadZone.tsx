import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, File as FileIcon } from 'lucide-react';
import { uploadFile } from '../api/fileserver';
import type { FileItem } from '../types';
import { formatBytes } from '../utils/format';
import { clsx } from 'clsx';

interface UploadEntry {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  progress: number;
}

interface Props {
  onUploaded: (item: FileItem) => void;
  onClose: () => void;
  initialFiles?: File[];
}

export default function UploadZone({ onUploaded, onClose, initialFiles }: Props) {
  const [queue, setQueue] = useState<UploadEntry[]>([]);

  const processFile = useCallback(async (file: File) => {
    setQueue(q => q.map(e => e.file === file ? { ...e, status: 'uploading', progress: 0 } : e));
    try {
      const result = await uploadFile(file, pct => {
        setQueue(q => q.map(e => e.file === file ? { ...e, progress: pct } : e));
      });
      const item: FileItem = {
        ...result,
        id: result.id!,
        folder_id: result.folder_id ?? null,
        is_starred: result.is_starred ?? false,
        uploadedAt: result.uploadedAt ?? new Date().toISOString(),
      };
      onUploaded(item);
      setQueue(q => q.map(e => e.file === file ? { ...e, status: 'done', progress: 100 } : e));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Upload failed';
      setQueue(q => q.map(e => e.file === file ? { ...e, status: 'error', error: msg, progress: 0 } : e));
    }
  }, [onUploaded]);

  const enqueue = useCallback((files: File[]) => {
    const entries: UploadEntry[] = files.map(f => ({ file: f, status: 'pending', progress: 0 }));
    setQueue(prev => [...prev, ...entries]);
    entries.forEach(e => processFile(e.file));
  }, [processFile]);

  // Auto-queue initialFiles (paste / global drop)
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) enqueue(initialFiles);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDrop = useCallback((accepted: File[]) => enqueue(accepted), [enqueue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const allDone = queue.length > 0 && queue.every(e => e.status === 'done' || e.status === 'error');
  const uploading = queue.filter(e => e.status === 'uploading').length;
  const done = queue.filter(e => e.status === 'done').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-900">Upload files</h2>
            {queue.length > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                {uploading > 0 ? `Uploading ${uploading} file${uploading > 1 ? 's' : ''}…` : `${done} of ${queue.length} complete`}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={clsx(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50',
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                isDragActive ? 'bg-blue-100' : 'bg-slate-100',
              )}>
                <Upload size={22} className={isDragActive ? 'text-blue-600' : 'text-slate-400'} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  or <span className="text-blue-600">browse to upload</span>
                </p>
              </div>
              <p className="text-xs text-slate-400">Any file type · Tip: paste files with Ctrl+V</p>
            </div>
          </div>

          {/* Queue */}
          {queue.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {queue.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <FileIcon size={14} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-700 truncate">{entry.file.name}</p>
                      <span className="text-xs text-slate-400 shrink-0">{formatBytes(entry.file.size)}</span>
                    </div>
                    {entry.status === 'error' && (
                      <p className="text-xs text-red-500 mt-0.5">{entry.error}</p>
                    )}
                    {entry.status === 'uploading' && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-200"
                            style={{ width: `${entry.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-blue-500 font-medium shrink-0 w-8 text-right">
                          {entry.progress}%
                        </span>
                      </div>
                    )}
                    {entry.status === 'done' && (
                      <p className="text-xs text-emerald-500 mt-0.5">Uploaded successfully</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {entry.status === 'pending'   && <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                    {entry.status === 'uploading' && <Loader2 size={16} className="text-blue-500 animate-spin" />}
                    {entry.status === 'done'      && <CheckCircle2 size={16} className="text-emerald-500" />}
                    {entry.status === 'error'     && <AlertCircle size={16} className="text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          {allDone ? (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
