import { useState } from 'react';
import { MoreVertical, Trash2, RefreshCw, Eye, Download, Link2, Check } from 'lucide-react';
import type { FileItem } from '../types';
import { formatBytes, formatDate, getFileCategory } from '../utils/format';
import { getPresignedUrl } from '../api/fileserver';
import FileIcon, { iconColor, iconBg } from './FileIcon';
import toast from 'react-hot-toast';

interface Props {
  item: FileItem;
  onPreview: () => void;
  onDelete: () => void;
  onUpdate: () => void;
  onUrlRefreshed?: (path: string, url: string) => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export default function FileCard({ item, onPreview, onDelete, onUpdate, onUrlRefreshed, selected, onToggleSelect }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const category = getFileCategory(item.content_type);

  const copyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    toast.success('Link copied');
    setMenuOpen(false);
  };

  return (
    <div
      onClick={onPreview}
      className={`group bg-white border rounded-xl overflow-hidden cursor-pointer transition-all ${
        selected
          ? 'border-blue-400 shadow-md ring-2 ring-blue-200'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      {/* Thumbnail / icon area */}
      <div className={`h-32 flex items-center justify-center relative ${iconBg(item.content_type)}`}>
        {category === 'image' ? (
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={e => {
              const img = e.target as HTMLImageElement;
              getPresignedUrl(item.path)
                .then(fresh => { img.src = fresh; onUrlRefreshed?.(item.path, fresh); })
                .catch(() => { img.style.display = 'none'; });
            }}
          />
        ) : (
          <FileIcon contentType={item.content_type} size={40} className={iconColor(item.content_type)} />
        )}

        {/* Bulk-select checkbox */}
        {onToggleSelect && (
          <div
            onClick={e => { e.stopPropagation(); onToggleSelect(); }}
            className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all z-10 ${
              selected
                ? 'bg-blue-600 border-blue-600 opacity-100'
                : 'bg-white/90 border-slate-300 opacity-0 group-hover:opacity-100'
            }`}
          >
            {selected && <Check size={11} className="text-white" strokeWidth={3} />}
          </div>
        )}

        {/* Menu button */}
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-600"
        >
          <MoreVertical size={14} />
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
            <div className="absolute top-8 right-2 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]">
              {[
                { icon: Eye,      label: 'Preview',   action: () => { setMenuOpen(false); onPreview(); } },
                { icon: RefreshCw,label: 'Replace',   action: () => { setMenuOpen(false); onUpdate(); } },
                { icon: Link2,    label: 'Copy link', action: copyLink },
                { icon: Download, label: 'Download',  action: (e: React.MouseEvent) => { e.stopPropagation(); window.open(item.url, '_blank'); setMenuOpen(false); } },
                { icon: Trash2,   label: 'Delete',    action: (e: React.MouseEvent) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }, danger: true },
              ].map(({ icon: Icon, label, action, danger }) => (
                <button
                  key={label}
                  onClick={e => { e.stopPropagation(); action(e as React.MouseEvent); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-400">{formatBytes(item.size)}</span>
          <span className="text-xs text-slate-400">{formatDate(item.uploadedAt)}</span>
        </div>
      </div>
    </div>
  );
}
