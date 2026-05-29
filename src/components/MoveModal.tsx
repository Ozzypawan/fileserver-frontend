import { useState, useEffect, useCallback } from 'react';
import { X, Folder, ChevronRight, ChevronDown, Loader2, MoveRight } from 'lucide-react';
import { listFolders } from '../api/folders';
import type { FolderItem } from '../types';
import { clsx } from 'clsx';

interface Props {
  title?: string;
  currentFolderId?: string | null;
  excludeIds?: string[];
  onConfirm: (folderId: string | null) => Promise<void>;
  onClose: () => void;
}

interface TreeNode {
  folder: FolderItem;
  children: TreeNode[];
  expanded: boolean;
  loaded: boolean;
  loading: boolean;
}

// Sentinel ID for root selection
const ROOT_ID = '__root__';

export default function MoveModal({
  title = 'Move to',
  currentFolderId,
  excludeIds = [],
  onConfirm,
  onClose,
}: Props) {
  const [roots, setRoots] = useState<TreeNode[]>([]);
  const [rootsLoading, setRootsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(undefined); // undefined = nothing picked yet
  const [confirming, setConfirming] = useState(false);

  // Load root-level folders on mount
  useEffect(() => {
    let cancelled = false;
    setRootsLoading(true);
    listFolders(null)
      .then(data => {
        if (cancelled) return;
        const nodes: TreeNode[] = data
          .filter(f => !excludeIds.includes(f.id))
          .map(f => ({
            folder: f as FolderItem,
            children: [],
            expanded: false,
            loaded: false,
            loading: false,
          }));
        setRoots(nodes);
      })
      .catch(() => {/* silent — user can retry by closing and reopening */})
      .finally(() => {
        if (!cancelled) setRootsLoading(false);
      });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recursively update a node in the tree by folder id
  const updateNode = useCallback(
    (
      nodes: TreeNode[],
      targetId: string,
      patch: Partial<TreeNode> | ((n: TreeNode) => Partial<TreeNode>),
    ): TreeNode[] =>
      nodes.map(node => {
        if (node.folder.id === targetId) {
          const delta = typeof patch === 'function' ? patch(node) : patch;
          return { ...node, ...delta };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateNode(node.children, targetId, patch) };
        }
        return node;
      }),
    [],
  );

  const handleToggle = async (folderId: string, alreadyLoaded: boolean, currentlyExpanded: boolean) => {
    if (currentlyExpanded) {
      // Collapse
      setRoots(prev => updateNode(prev, folderId, { expanded: false }));
      return;
    }

    if (alreadyLoaded) {
      // Just expand
      setRoots(prev => updateNode(prev, folderId, { expanded: true }));
      return;
    }

    // Fetch children
    setRoots(prev => updateNode(prev, folderId, { loading: true, expanded: true }));
    try {
      const data = await listFolders(folderId);
      const children: TreeNode[] = data
        .filter(f => !excludeIds.includes(f.id))
        .map(f => ({
          folder: f as FolderItem,
          children: [],
          expanded: false,
          loaded: false,
          loading: false,
        }));
      setRoots(prev =>
        updateNode(prev, folderId, { children, loaded: true, loading: false }),
      );
    } catch {
      setRoots(prev => updateNode(prev, folderId, { loading: false, expanded: false }));
    }
  };

  const handleConfirm = async () => {
    if (selectedId === undefined) return;
    setConfirming(true);
    try {
      await onConfirm(selectedId === ROOT_ID ? null : selectedId);
    } finally {
      setConfirming(false);
    }
  };

  const renderNode = (node: TreeNode, depth: number): React.ReactNode => {
    const isSelected = selectedId === node.folder.id;
    const isCurrentLocation = node.folder.id === currentFolderId;
    const hasChildren = (node.folder.child_count ?? 1) > 0 || node.children.length > 0;

    return (
      <div key={node.folder.id}>
        <div
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer select-none transition-colors group',
            isSelected
              ? 'bg-blue-600 text-white'
              : 'hover:bg-slate-50 text-slate-700',
          )}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
          onClick={() => !isCurrentLocation && setSelectedId(node.folder.id)}
        >
          {/* Chevron toggle */}
          <button
            className={clsx(
              'p-0.5 rounded transition-colors shrink-0',
              isSelected ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600',
              !hasChildren && 'invisible',
            )}
            onClick={e => {
              e.stopPropagation();
              handleToggle(node.folder.id, node.loaded, node.expanded);
            }}
          >
            {node.loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : node.expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          <Folder
            size={15}
            className={clsx(
              'shrink-0',
              isSelected ? 'text-white' : 'text-blue-400',
            )}
          />

          <span className="text-sm truncate flex-1">{node.folder.name}</span>

          {isCurrentLocation && (
            <span
              className={clsx(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0',
                isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500',
              )}
            >
              current
            </span>
          )}
        </div>

        {node.expanded && node.children.length > 0 && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}

        {node.expanded && node.loaded && node.children.length === 0 && (
          <div
            className="text-xs text-slate-400 italic py-1.5"
            style={{ paddingLeft: `${12 + (depth + 1) * 20 + 20}px` }}
          >
            Empty folder
          </div>
        )}
      </div>
    );
  };

  const isRootSelected = selectedId === ROOT_ID;
  const isRootCurrent = currentFolderId == null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Folder tree */}
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
          {/* Root / My Files option */}
          <div
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer select-none transition-colors',
              isRootSelected
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-50 text-slate-700',
            )}
            onClick={() => !isRootCurrent && setSelectedId(ROOT_ID)}
          >
            {/* Placeholder to align with toggle button */}
            <span className="w-5 shrink-0" />
            <Folder
              size={15}
              className={clsx('shrink-0', isRootSelected ? 'text-white' : 'text-blue-400')}
            />
            <span className="text-sm font-medium flex-1">Root / My Files</span>
            {isRootCurrent && (
              <span
                className={clsx(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0',
                  isRootSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                current
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100" />

          {/* Root-level folders */}
          {rootsLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : roots.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No folders available</p>
          ) : (
            roots.map(node => renderNode(node, 0))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedId === undefined || confirming}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MoveRight size={14} />
            {confirming ? 'Moving…' : 'Move here'}
          </button>
        </div>
      </div>
    </div>
  );
}
