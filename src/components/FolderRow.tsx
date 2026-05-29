import { useState } from 'react';
import { Folder, MoreVertical, Pencil, FolderInput, Trash2 } from 'lucide-react';
import type { FolderItem } from '../types';
import { formatDate } from '../utils/format';

interface Props {
  folder: FolderItem;
  onOpen: (folder: FolderItem) => void;
  onRename: (folder: FolderItem) => void;
  onMove: (folder: FolderItem) => void;
  onDelete: (folder: FolderItem) => void;
}

export default function FolderRow({ folder, onOpen, onRename, onMove, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      icon: Pencil,
      label: 'Rename',
      action: () => { setMenuOpen(false); onRename(folder); },
      danger: false,
    },
    {
      icon: FolderInput,
      label: 'Move',
      action: () => { setMenuOpen(false); onMove(folder); },
      danger: false,
    },
    {
      icon: Trash2,
      label: 'Delete',
      action: () => { setMenuOpen(false); onDelete(folder); },
      danger: true,
    },
  ];

  return (
    <tr
      onClick={() => onOpen(folder)}
      className="group border-b border-slate-100 cursor-pointer transition-colors hover:bg-blue-50/40"
    >
      {/* Spacer to align with FileRow checkbox column */}
      <td className="pl-4 pr-1 py-3 w-8" />

      {/* Name + icon */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-50">
            <Folder size={15} className="text-amber-500" fill="currentColor" />
          </div>
          <span className="text-sm font-medium text-slate-800 truncate max-w-[220px]">
            {folder.name}
          </span>
        </div>
      </td>

      {/* Type label — mirrors "extension" column in FileRow */}
      <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">
        Folder
      </td>

      {/* Child count — mirrors "size" column in FileRow */}
      <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
        {folder.child_count != null
          ? `${folder.child_count} item${folder.child_count !== 1 ? 's' : ''}`
          : '—'}
      </td>

      {/* Created date — mirrors "uploadedAt" column in FileRow */}
      <td className="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell">
        {formatDate(folder.created_at)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-end">
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
              title="More options"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); }}
                />
                <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]">
                  {menuItems.map(({ icon: Icon, label, action, danger }) => (
                    <button
                      key={label}
                      onClick={e => { e.stopPropagation(); action(); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                        danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-slate-700 hover:bg-slate-50'
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
        </div>
      </td>
    </tr>
  );
}
