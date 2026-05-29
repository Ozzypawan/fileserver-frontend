import { useState, useEffect, useRef } from 'react';
import { FolderOpen, MoreVertical, Pencil, FolderInput, Trash2 } from 'lucide-react';
import type { FolderItem } from '../types';
import { formatDate } from '../utils/format';

interface Props {
  folder: FolderItem;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export default function FolderCard({ folder, onOpen, onRename, onMove, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when the user clicks outside it
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(v => !v);
  };

  const menuItems = [
    {
      icon: Pencil,
      label: 'Rename',
      action: () => { setMenuOpen(false); onRename(); },
      danger: false,
    },
    {
      icon: FolderInput,
      label: 'Move to',
      action: () => { setMenuOpen(false); onMove(); },
      danger: false,
    },
    {
      icon: Trash2,
      label: 'Delete',
      action: () => { setMenuOpen(false); onDelete(); },
      danger: true,
    },
  ];

  return (
    <div
      onDoubleClick={onOpen}
      onContextMenu={handleContextMenu}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer transition-all hover:border-amber-300 hover:shadow-md"
    >
      {/* Icon area */}
      <div className="h-32 flex items-center justify-center relative bg-amber-50">
        <FolderOpen size={48} className="text-amber-400" strokeWidth={1.5} />

        {/* ⋯ button — visible on hover */}
        <div ref={menuRef} className="absolute top-2 right-2">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-600"
            aria-label="Folder options"
          >
            <MoreVertical size={14} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              {/* Invisible backdrop to catch outside clicks without blocking the page */}
              <div
                className="fixed inset-0 z-10"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); }}
              />
              <div className="absolute top-8 right-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]">
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

      {/* Info */}
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-slate-800 truncate">{folder.name}</p>
        <div className="flex items-center justify-between mt-1">
          {folder.child_count !== undefined ? (
            <span className="text-xs text-slate-400">
              {folder.child_count} {folder.child_count === 1 ? 'item' : 'items'}
            </span>
          ) : (
            <span className="text-xs text-slate-400">Folder</span>
          )}
          <span className="text-xs text-slate-400">{formatDate(folder.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
