import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { updateFile } from '../api/fileserver';
import type { FileItem } from '../types';
import toast from 'react-hot-toast';

interface Props {
  item: FileItem;
  onUpdated: (updated: FileItem) => void;
  onClose: () => void;
}

export default function UpdateModal({ item, onUpdated, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(item.name);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await updateFile(item.path, file, name !== item.name ? name : undefined);
      const updated: FileItem = {
        ...result,
        id: result.id!,
        folder_id: result.folder_id ?? null,
        is_starred: result.is_starred ?? false,
        uploadedAt: new Date().toISOString(),
      };
      toast.success('File updated');
      onUpdated(updated);
    } catch {
      toast.error('Failed to update file');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Replace file</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* New name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">File name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* File picker */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">New file</label>
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-xl p-5 text-center cursor-pointer transition-colors"
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
                  <Upload size={14} className="text-blue-500" />
                  <span className="font-medium truncate max-w-xs">{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload size={18} className="text-slate-400" />
                  <p className="text-sm text-slate-500">Click to choose a file</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Replacing…' : 'Replace file'}
          </button>
        </div>
      </div>
    </div>
  );
}
