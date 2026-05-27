import { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { deleteFile } from '../api/fileserver';
import toast from 'react-hot-toast';

interface Props {
  path: string;
  name: string;
  onDeleted: () => void;
  onClose: () => void;
}

export default function DeleteModal({ path, name, onDeleted, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteFile(path);
      toast.success('File deleted');
      onDeleted();
    } catch {
      toast.error('Failed to delete file');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Delete file</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Are you sure you want to delete <span className="font-medium text-slate-900">"{name}"</span>?
              </p>
              <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
