import { Trash2, RefreshCw, Eye, Download, Link2, Check } from 'lucide-react';
import type { FileItem } from '../types';
import { formatBytes, formatDate } from '../utils/format';
import FileIcon, { iconColor, iconBg } from './FileIcon';
import toast from 'react-hot-toast';

interface Props {
  item: FileItem;
  onPreview: () => void;
  onDelete: () => void;
  onUpdate: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export default function FileRow({ item, onPreview, onDelete, onUpdate, selected, onToggleSelect }: Props) {
  const copyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    toast.success('Link copied');
  };

  return (
    <tr
      onClick={onPreview}
      className={`group border-b border-slate-100 cursor-pointer transition-colors ${
        selected ? 'bg-blue-50' : 'hover:bg-blue-50/40'
      }`}
    >
      {/* Checkbox */}
      <td className="pl-4 pr-1 py-3 w-8" onClick={e => e.stopPropagation()}>
        {onToggleSelect && (
          <div
            onClick={onToggleSelect}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
              selected
                ? 'bg-blue-600 border-blue-600'
                : 'border-slate-300 opacity-0 group-hover:opacity-100'
            }`}
          >
            {selected && <Check size={9} className="text-white" strokeWidth={3} />}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg(item.content_type)}`}>
            <FileIcon contentType={item.content_type} size={15} className={iconColor(item.content_type)} />
          </div>
          <span className="text-sm font-medium text-slate-800 truncate max-w-[220px]">{item.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">
        {item.extension ? item.extension.toUpperCase() : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
        {formatBytes(item.size)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell">
        {formatDate(item.uploadedAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <ActionBtn icon={Eye}      title="Preview"   onClick={e => { e.stopPropagation(); onPreview(); }} />
          <ActionBtn icon={RefreshCw}title="Replace"   onClick={e => { e.stopPropagation(); onUpdate(); }} />
          <ActionBtn icon={Link2}    title="Copy link" onClick={copyLink} />
          <ActionBtn icon={Download} title="Download"  onClick={e => { e.stopPropagation(); window.open(item.url, '_blank'); }} />
          <ActionBtn icon={Trash2}   title="Delete"    onClick={e => { e.stopPropagation(); onDelete(); }} danger />
        </div>
      </td>
    </tr>
  );
}

function ActionBtn({ icon: Icon, title, onClick, danger }: {
  icon: React.ElementType; title: string; onClick: (e: React.MouseEvent) => void; danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${
        danger ? 'text-red-500 hover:bg-red-50' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon size={14} />
    </button>
  );
}
