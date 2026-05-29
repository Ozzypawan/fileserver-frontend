import { useState, useEffect, useCallback } from 'react';
import type { FolderItem, BreadcrumbItem } from '../types';
import { listFolders, getFolder } from '../api/folders';

// ── Module-level singleton so all hook callers share the same state ──

interface FolderState {
  currentFolderId: string | null;
  breadcrumb: BreadcrumbItem[];
  folders: FolderItem[];
  loading: boolean;
}

let _state: FolderState = {
  currentFolderId: null,
  breadcrumb: [{ id: null, name: 'My Files' }],
  folders: [],
  loading: false,
};

const _listeners = new Set<() => void>();
const _notify = () => _listeners.forEach(fn => fn());

function _setState(patch: Partial<FolderState>) {
  _state = { ..._state, ...patch };
  _notify();
}

async function _loadRoot() {
  _setState({ loading: true });
  try {
    const folders = await listFolders(null);
    _setState({
      currentFolderId: null,
      breadcrumb: [{ id: null, name: 'My Files' }],
      folders,
      loading: false,
    });
  } catch {
    _setState({ loading: false });
  }
}

async function _loadFolder(folderId: string) {
  _setState({ loading: true });
  try {
    const { breadcrumb, children } = await getFolder(folderId);
    _setState({
      currentFolderId: folderId,
      breadcrumb,
      folders: children,
      loading: false,
    });
  } catch {
    _setState({ loading: false });
  }
}

export function useFolderStore() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const tick = () => rerender(n => n + 1);
    _listeners.add(tick);
    return () => { _listeners.delete(tick); };
  }, []);

  const navigateTo = useCallback((folderId: string | null) => {
    if (folderId === null) {
      _loadRoot();
    } else {
      _loadFolder(folderId);
    }
  }, []);

  const refresh = useCallback(() => {
    if (_state.currentFolderId === null) {
      _loadRoot();
    } else {
      _loadFolder(_state.currentFolderId);
    }
  }, []);

  return {
    currentFolderId: _state.currentFolderId,
    breadcrumb: _state.breadcrumb,
    folders: _state.folders,
    loading: _state.loading,
    navigateTo,
    refresh,
  };
}
