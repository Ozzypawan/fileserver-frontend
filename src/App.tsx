import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { CloudUpload, FolderOpen, Trash2, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import FileCard from './components/FileCard';
import FileRow from './components/FileRow';
import UploadZone from './components/UploadZone';
import DeleteModal from './components/DeleteModal';
import UpdateModal from './components/UpdateModal';
import PreviewModal from './components/PreviewModal';
import LandingPage from './components/LandingPage';
import { useFileStore } from './store/useFileStore';
import { deleteFile } from './api/fileserver';
import type { FileItem, SortKey, ViewMode } from './types';

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  const {
    files, allFiles, totalFiles, totalSize, typeCounts,
    addFile, removeFile, removeFiles, replaceFile, updateUrl,
    search, setSearch,
    sortKey, setSortKey, sortDir, setSortDir,
    filterType, setFilterType,
  } = useFileStore();

  const [viewMode, setViewMode]     = useState<ViewMode>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [initialUploadFiles, setInitialUploadFiles] = useState<File[] | undefined>();
  const [deleting,   setDeleting]   = useState<FileItem | null>(null);
  const [updating,   setUpdating]   = useState<FileItem | null>(null);
  const [previewing, setPreviewing] = useState<FileItem | null>(null);
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── Preview navigation ───────────────────────────────────────
  const previewIndex = previewing ? files.findIndex(f => f.path === previewing.path) : -1;
  const hasPrev = previewIndex > 0;
  const hasNext = previewIndex < files.length - 1;
  const handlePrev = useCallback(() => {
    if (previewIndex > 0) setPreviewing(files[previewIndex - 1]);
  }, [previewIndex, files]);
  const handleNext = useCallback(() => {
    if (previewIndex < files.length - 1) setPreviewing(files[previewIndex + 1]);
  }, [previewIndex, files]);

  // ── Bulk operations ──────────────────────────────────────────
  const toggleSelect = (path: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const paths = Array.from(selected);
    const id = toast.loading(`Deleting ${paths.length} files…`);
    try {
      await Promise.all(paths.map(p => deleteFile(p)));
      removeFiles(paths);
      setSelected(new Set());
      toast.success(`${paths.length} file${paths.length > 1 ? 's' : ''} deleted`, { id });
    } catch {
      toast.error('Some files could not be deleted', { id });
    }
  };

  // ── Paste-to-upload ──────────────────────────────────────────
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const pasted = Array.from(e.clipboardData?.items ?? [])
        .filter(i => i.kind === 'file')
        .map(i => i.getAsFile())
        .filter(Boolean) as File[];
      if (pasted.length > 0) {
        setInitialUploadFiles(pasted);
        setShowUpload(true);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  // ── Global drag-drop ─────────────────────────────────────────
  useEffect(() => {
    let dragCounter = 0;
    const onDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) { dragCounter++; setIsDragging(true); }
    };
    const onDragLeave = () => { dragCounter--; if (dragCounter <= 0) { dragCounter = 0; setIsDragging(false); } };
    const onDragOver  = (e: DragEvent) => e.preventDefault();
    const onDrop      = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer?.files ?? []);
      if (dropped.length > 0 && !showUpload) {
        setInitialUploadFiles(dropped);
        setShowUpload(true);
      }
    };
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover',  onDragOver);
    window.addEventListener('drop',      onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover',  onDragOver);
      window.removeEventListener('drop',      onDrop);
    };
  }, [showUpload]);

  if (view === 'landing') return <LandingPage onGetStarted={() => setView('app')} />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        totalFiles={totalFiles}
        totalSize={totalSize}
        onUploadClick={() => setShowUpload(true)}
        onHome={() => setView('landing')}
        allFiles={allFiles}
      />

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">All files</h1>
            <p className="text-sm text-slate-500 mt-1">
              {totalFiles === 0
                ? 'No files yet — upload your first file to get started'
                : `${totalFiles} ${totalFiles === 1 ? 'file' : 'files'} stored`}
            </p>
          </div>

          {totalFiles === 0 && !search ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <FolderOpen size={28} className="text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">No files yet</h2>
              <p className="text-sm text-slate-500 mb-6 max-w-xs">
                Upload your first file, drag and drop anywhere, or paste from clipboard.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <CloudUpload size={16} />
                Upload files
              </button>
            </div>
          ) : (
            <>
              <Toolbar
                search={search}
                onSearch={setSearch}
                viewMode={viewMode}
                onViewMode={setViewMode}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                filterType={filterType}
                onFilterType={type => { setFilterType(type); setSelected(new Set()); }}
                typeCounts={typeCounts}
                total={files.length}
              />

              {files.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  No files match your search.
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {files.map(f => (
                    <FileCard
                      key={f.path}
                      item={f}
                      onPreview={() => setPreviewing(f)}
                      onDelete={() => setDeleting(f)}
                      onUpdate={() => setUpdating(f)}
                      selected={selected.has(f.path)}
                      onToggleSelect={() => toggleSelect(f.path)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="pl-4 pr-1 py-3 w-8" />
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Size</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Uploaded</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {files.map(f => (
                        <FileRow
                          key={f.path}
                          item={f}
                          onPreview={() => setPreviewing(f)}
                          onDelete={() => setDeleting(f)}
                          onUpdate={() => setUpdating(f)}
                          selected={selected.has(f.path)}
                          onToggleSelect={() => toggleSelect(f.path)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Global drag-drop overlay ── */}
      {isDragging && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-sm border-4 border-dashed border-blue-400 m-3 rounded-2xl" />
          <div className="relative bg-white rounded-2xl shadow-2xl px-12 py-10 text-center">
            <CloudUpload size={40} className="text-blue-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-900">Drop to upload</p>
            <p className="text-sm text-slate-500 mt-1">Release to add files to your library</p>
          </div>
        </div>
      )}

      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl">
          <span className="text-sm font-medium">
            {selected.size} file{selected.size > 1 ? 's' : ''} selected
          </span>
          <div className="w-px h-4 bg-white/20" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            <Trash2 size={14} />
            Delete
          </button>
          <div className="w-px h-4 bg-white/20" />
          <button
            onClick={() => setSelected(new Set())}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <X size={13} />
            Clear
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {showUpload && (
        <UploadZone
          onUploaded={item => addFile(item)}
          onClose={() => { setShowUpload(false); setInitialUploadFiles(undefined); }}
          initialFiles={initialUploadFiles}
        />
      )}
      {deleting && (
        <DeleteModal
          path={deleting.path}
          name={deleting.name}
          onDeleted={() => { removeFile(deleting.path); setDeleting(null); }}
          onClose={() => setDeleting(null)}
        />
      )}
      {updating && (
        <UpdateModal
          item={updating}
          onUpdated={updated => { replaceFile(updating.path, updated); setUpdating(null); }}
          onClose={() => setUpdating(null)}
        />
      )}
      {previewing && (
        <PreviewModal
          item={previewing}
          onClose={() => setPreviewing(null)}
          onUrlRefreshed={updateUrl}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { fontSize: '13px', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,.12)' },
        }}
      />
    </div>
  );
}
