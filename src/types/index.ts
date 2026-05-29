export interface FileItem {
  id: string;
  name: string;
  size: number;
  content_type: string;
  extension: string;
  url: string;
  path: string;
  uploadedAt: string;
  folder_id: string | null;
  is_starred: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  child_count?: number;
}

export interface BreadcrumbItem {
  id: string | null; // null = root
  name: string;
}

export type ViewMode = 'grid' | 'list';

export type SortKey = 'name' | 'size' | 'uploadedAt' | 'extension';
export type SortDir = 'asc' | 'desc';
export type FilterType = 'all' | 'image' | 'video' | 'audio' | 'pdf' | 'doc' | 'csv' | 'text' | 'other';
export type NavView = 'files' | 'starred' | 'trash';
