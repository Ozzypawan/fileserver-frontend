import { X, HardDrive, Upload, FolderPlus, FileImage, FileVideo, FileAudio, FileType2, ScrollText, FileSpreadsheet, FileText, File, LogOut, Home, Star, Trash2, Settings } from 'lucide-react';
import type { FileItem, NavView } from '../types';
import { formatBytes, getFileCategory } from '../utils/format';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  totalFiles: number;
  totalSize: number;
  onUploadClick: () => void;
  onHome: () => void;
  allFiles: FileItem[];
  open: boolean;
  onClose: () => void;
  navView: NavView;
  onNavView: (v: NavView) => void;
  onNewFolder: () => void;
}

const TYPE_META = [
  { cat: 'image', label: 'Images',       Icon: FileImage,        color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { cat: 'video', label: 'Video',         Icon: FileVideo,        color: 'text-violet-500',  bg: 'bg-violet-50'  },
  { cat: 'audio', label: 'Audio',         Icon: FileAudio,        color: 'text-amber-500',   bg: 'bg-amber-50'   },
  { cat: 'pdf',   label: 'PDF',           Icon: FileType2,        color: 'text-red-500',     bg: 'bg-red-50'     },
  { cat: 'doc',   label: 'Documents',     Icon: ScrollText,       color: 'text-blue-500',    bg: 'bg-blue-50'    },
  { cat: 'csv',   label: 'Spreadsheets',  Icon: FileSpreadsheet,  color: 'text-green-600',   bg: 'bg-green-50'   },
  { cat: 'text',  label: 'Text',          Icon: FileText,         color: 'text-sky-500',     bg: 'bg-sky-50'     },
  { cat: 'other', label: 'Other',         Icon: File,             color: 'text-slate-400',   bg: 'bg-slate-100'  },
];

export default function Sidebar({ totalFiles, totalSize, onUploadClick, onHome, allFiles, open, onClose, navView, onNavView, onNewFolder }: Props) {
  const { user, logout } = useAuthStore();
  const catStats = allFiles.reduce((acc, f) => {
    const cat = getFileCategory(f.content_type);
    acc[cat] = { count: (acc[cat]?.count ?? 0) + 1, size: (acc[cat]?.size ?? 0) + f.size };
    return acc;
  }, {} as Record<string, { count: number; size: number }>);

  const activeTypes = TYPE_META.filter(m => (catStats[m.cat]?.count ?? 0) > 0);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        w-64 md:w-60 shrink-0
        bg-white border-r border-slate-200
        flex flex-col h-screen
        transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <button onClick={() => { onHome(); onClose(); }} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <HardDrive size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-base tracking-tight">Filesewa</span>
          </button>
          {/* Close button — mobile only */}
          <button onClick={onClose} className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Upload + New Folder buttons */}
        <div className="px-4 pt-5 space-y-2">
          <button
            onClick={() => { onUploadClick(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            <Upload size={15} />
            Upload files
          </button>
          {navView === 'files' && (
            <button
              onClick={() => { onNewFolder(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <FolderPlus size={15} />
              New folder
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="px-3 pt-4 space-y-0.5">
          <button
            onClick={() => { onNavView('files'); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${navView === 'files' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Home size={16} />
            <span className="text-sm font-medium">My Files</span>
          </button>
          <button
            onClick={() => { onNavView('starred'); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${navView === 'starred' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Star size={16} />
            <span className="text-sm font-medium">Starred</span>
          </button>
          <button
            onClick={() => { onNavView('trash'); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${navView === 'trash' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Trash2 size={16} />
            <span className="text-sm font-medium">Trash</span>
          </button>
          <button
            onClick={() => { onNavView('settings'); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${navView === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings size={16} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </nav>

        {/* File type breakdown */}
        {activeTypes.length > 0 && (
          <div className="px-4 pt-5 flex-1 overflow-y-auto">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">By type</p>
            <div className="space-y-1">
              {activeTypes.map(({ cat, label, Icon, color, bg }) => {
                const { count, size } = catStats[cat]!;
                return (
                  <div key={cat} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon size={12} className={color} />
                    </div>
                    <span className="text-xs text-slate-600 flex-1 truncate">{label}</span>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-slate-700">{count}</span>
                      <span className="text-[10px] text-slate-400 ml-1">{formatBytes(size)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Storage stats */}
        <div className="px-4 pt-5 border-t border-slate-100 mt-auto">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Storage</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{totalFiles} {totalFiles === 1 ? 'file' : 'files'}</span>
              <span className="text-slate-900 font-medium">{formatBytes(totalSize)}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.min((totalSize / (1024 * 1024 * 1024 * 10)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">of 10 GB free</p>
          </div>
        </div>

        {/* User + logout */}
        {user && (
          <div className="px-4 py-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-blue-600">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">{user.name || user.email}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
