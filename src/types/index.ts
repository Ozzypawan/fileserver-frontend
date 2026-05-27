export interface FileItem {
  name: string;
  size: number;
  content_type: string;
  extension: string;
  url: string;
  path: string;
  uploadedAt: string;
}

export type ViewMode = 'grid' | 'list';

export type SortKey = 'name' | 'size' | 'uploadedAt' | 'extension';
export type SortDir = 'asc' | 'desc';
export type FilterType = 'all' | 'image' | 'video' | 'audio' | 'pdf' | 'doc' | 'csv' | 'text' | 'other';
