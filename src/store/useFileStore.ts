import { useState, useEffect, useCallback } from 'react';
import type { FileItem, SortKey, SortDir, FilterType } from '../types';
import { getFileCategory } from '../utils/format';
import { listFiles } from '../api/fileserver';

const STORAGE_KEY = 'fileserver_files';

function load(): FileItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

function save(files: FileItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

export function useFileStore() {
  const [rawFiles, setFiles] = useState<FileItem[]>(load);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [sortKey, setSortKey]     = useState<SortKey>('uploadedAt');
  const [sortDir, setSortDir]     = useState<SortDir>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Fetch global file list from backend on mount
  useEffect(() => {
    listFiles()
      .then(data => {
        const items: FileItem[] = data.map(f => ({
          name:         f.name,
          size:         f.size,
          content_type: f.content_type,
          extension:    f.extension,
          url:          f.url,
          path:         f.path,
          uploadedAt:   f.uploadedAt ?? new Date().toISOString(),
        }));
        setFiles(items);
        save(items);
      })
      .catch(() => {
        // endpoint not yet available — keep localStorage data silently
      })
      .finally(() => setLoading(false));
  }, []);

  // Keep localStorage in sync whenever files change
  useEffect(() => { save(rawFiles); }, [rawFiles]);

  const addFile = useCallback((f: FileItem) => {
    setFiles(prev => [f, ...prev.filter(x => x.path !== f.path)]);
  }, []);

  const removeFile = useCallback((path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path));
  }, []);

  const removeFiles = useCallback((paths: string[]) => {
    const set = new Set(paths);
    setFiles(prev => prev.filter(f => !set.has(f.path)));
  }, []);

  const replaceFile = useCallback((oldPath: string, f: FileItem) => {
    setFiles(prev => prev.map(x => x.path === oldPath ? f : x));
  }, []);

  const updateUrl = useCallback((path: string, url: string) => {
    setFiles(prev => prev.map(f => f.path === path ? { ...f, url } : f));
  }, []);

  const typeCounts = rawFiles.reduce((acc, f) => {
    const cat = getFileCategory(f.content_type);
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = [...rawFiles]
    .filter(f => filterType === 'all' || getFileCategory(f.content_type) === filterType)
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name')       cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'size')  cmp = a.size - b.size;
      else if (sortKey === 'extension') cmp = a.extension.localeCompare(b.extension);
      else cmp = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

  return {
    files: filtered,
    allFiles: rawFiles,
    loading,
    totalFiles: rawFiles.length,
    totalSize: rawFiles.reduce((s, f) => s + f.size, 0),
    typeCounts,
    addFile, removeFile, removeFiles, replaceFile, updateUrl,
    search, setSearch,
    sortKey, setSortKey,
    sortDir, setSortDir,
    filterType, setFilterType,
  };
}
