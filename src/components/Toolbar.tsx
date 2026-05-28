import { Search, LayoutGrid, List, ChevronUp, ChevronDown, X } from 'lucide-react';
import type { ViewMode, SortKey, SortDir, FilterType } from '../types';
import { clsx } from 'clsx';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  viewMode: ViewMode;
  onViewMode: (v: ViewMode) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  filterType: FilterType;
  onFilterType: (v: FilterType) => void;
  typeCounts: Record<string, number>;
  total: number;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name',       label: 'Name' },
  { key: 'size',       label: 'Size' },
  { key: 'extension',  label: 'Type' },
  { key: 'uploadedAt', label: 'Date' },
];

const FILTER_OPTIONS: { type: FilterType; label: string; color: string; active: string }[] = [
  { type: 'all',   label: 'All',    color: 'bg-slate-100 text-slate-600 hover:bg-slate-200',  active: 'bg-slate-800 text-white' },
  { type: 'image', label: 'Images', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', active: 'bg-emerald-500 text-white' },
  { type: 'video', label: 'Video',  color: 'bg-violet-50 text-violet-700 hover:bg-violet-100',  active: 'bg-violet-500 text-white' },
  { type: 'audio', label: 'Audio',  color: 'bg-amber-50 text-amber-700 hover:bg-amber-100',    active: 'bg-amber-500 text-white' },
  { type: 'pdf',   label: 'PDF',    color: 'bg-red-50 text-red-700 hover:bg-red-100',           active: 'bg-red-500 text-white' },
  { type: 'doc',   label: 'Docs',   color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',        active: 'bg-blue-500 text-white' },
  { type: 'csv',   label: 'CSV',    color: 'bg-green-50 text-green-700 hover:bg-green-100',     active: 'bg-green-500 text-white' },
  { type: 'text',  label: 'Text',   color: 'bg-sky-50 text-sky-700 hover:bg-sky-100',           active: 'bg-sky-500 text-white' },
];

export default function Toolbar({
  search, onSearch, viewMode, onViewMode,
  sortKey, sortDir, onSort,
  filterType, onFilterType, typeCounts,
  total,
}: Props) {
  const totalAll = Object.values(typeCounts).reduce((s, n) => s + n, 0);

  return (
    <div className="space-y-3 mb-6">
      {/* Filter chips — scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar"
           style={{ scrollbarWidth: 'none' }}>
        {FILTER_OPTIONS.map(({ type, label, color, active }) => {
          const count = type === 'all' ? totalAll : (typeCounts[type] ?? 0);
          if (type !== 'all' && count === 0) return null;
          const isActive = filterType === type;
          return (
            <button
              key={type}
              onClick={() => onFilterType(type)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                isActive ? active : color,
              )}
            >
              {label}
              <span className={clsx(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-white/25' : 'bg-black/8',
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Sort + View */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar"
           style={{ scrollbarWidth: 'none' }}>
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search files…"
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onSort(key)}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                sortKey === key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {label}
              {sortKey === key && (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
          <button
            onClick={() => onViewMode('grid')}
            className={clsx('p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100')}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewMode('list')}
            className={clsx('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100')}
          >
            <List size={15} />
          </button>
        </div>

        {total > 0 && (
          <span className="text-xs text-slate-400">{total} {total === 1 ? 'file' : 'files'}</span>
        )}
      </div>
    </div>
  );
}
