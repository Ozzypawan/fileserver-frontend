import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../store/useAuthStore';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = getRefreshToken();
      if (!refresh) return Promise.reject(err); // never logged in, don't logout

      if (!refreshing) {
        refreshing = axios.post<{ access: string }>(`${BASE}/fileserver-v1/api/auth/refresh/`, { refresh })
          .then(r => {
            const stored = JSON.parse(localStorage.getItem('fs_user') ?? 'null');
            if (stored) saveTokens(r.data.access, refresh, stored);
            return r.data.access;
          })
          .catch(() => { clearTokens(); return null; })
          .finally(() => { refreshing = null; });
      }
      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  },
);

export interface UploadResponse {
  id?: string;
  name: string;
  size: number;
  content_type: string;
  extension: string;
  url: string;
  path: string;
  uploadedAt?: string;
  folder_id?: string | null;
  is_starred?: boolean;
}

export async function uploadFile(file: File, onProgress?: (pct: number) => void): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<UploadResponse>('/fileserver-v1/api/upload/', form, {
    onUploadProgress: evt => {
      if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return data;
}

export async function listFiles(folderId?: string): Promise<(UploadResponse & { uploadedAt?: string })[]> {
  const params: Record<string, string> = {};
  if (folderId !== undefined) params.folder_id = folderId;
  const { data } = await api.get('/fileserver-v1/api/files/list/', { params });
  return data;
}

export async function getFileMeta(path: string): Promise<UploadResponse> {
  const { data } = await api.get<UploadResponse>('/fileserver-v1/api/files/', {
    params: { path },
  });
  return data;
}

export async function getPresignedUrl(path: string): Promise<string> {
  const { data } = await api.get<{ url: string }>('/fileserver-v1/api/files/presigned-url/', {
    params: { path },
  });
  return data.url;
}

export async function deleteFile(path: string): Promise<void> {
  await api.delete('/fileserver-v1/api/files/', { params: { path } });
}

export async function updateFile(path: string, file: File, newName?: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  if (newName) form.append('name', newName);
  const { data } = await api.put<UploadResponse>('/fileserver-v1/api/files/update/', form, {
    params: { path },
  });
  return data;
}

export async function renameFile(id: string, displayName: string): Promise<UploadResponse> {
  const { data } = await api.patch<UploadResponse>(`/fileserver-v1/api/files/${id}/rename/`, {
    display_name: displayName,
  });
  return data;
}

export async function moveFile(id: string, folderId: string | null): Promise<UploadResponse> {
  const { data } = await api.patch<UploadResponse>(`/fileserver-v1/api/files/${id}/move/`, {
    folder_id: folderId,
  });
  return data;
}

export async function copyFile(id: string, folderId?: string | null, name?: string): Promise<UploadResponse> {
  const body: Record<string, unknown> = {};
  if (folderId !== undefined) body.folder_id = folderId;
  if (name !== undefined) body.name = name;
  const { data } = await api.post<UploadResponse>(`/fileserver-v1/api/files/${id}/copy/`, body);
  return data;
}

export async function starFile(id: string): Promise<{ is_starred: boolean }> {
  const { data } = await api.post<{ is_starred: boolean }>(`/fileserver-v1/api/files/${id}/star/`);
  return data;
}

export async function trashFile(id: string): Promise<void> {
  await api.delete(`/fileserver-v1/api/files/${id}/trash/`);
}

export async function restoreFile(id: string): Promise<void> {
  await api.post(`/fileserver-v1/api/files/${id}/restore/`);
}

export async function permanentDeleteFile(id: string): Promise<void> {
  await api.delete(`/fileserver-v1/api/files/${id}/permanent/`);
}

export async function listStarred(): Promise<(UploadResponse & { uploadedAt?: string })[]> {
  const { data } = await api.get('/fileserver-v1/api/files/starred/');
  return data;
}

export async function listRecent(): Promise<(UploadResponse & { uploadedAt?: string })[]> {
  const { data } = await api.get('/fileserver-v1/api/files/recent/');
  return data;
}

export async function listTrash(): Promise<(UploadResponse & { uploadedAt?: string })[]> {
  const { data } = await api.get('/fileserver-v1/api/trash/');
  return data;
}

export async function bulkTrash(fileIds: string[], folderIds?: string[]): Promise<void> {
  await api.post('/fileserver-v1/api/files/bulk/trash/', {
    file_ids: fileIds,
    folder_ids: folderIds ?? [],
  });
}

export async function bulkRestore(fileIds: string[], folderIds?: string[]): Promise<void> {
  await api.post('/fileserver-v1/api/files/bulk/restore/', {
    file_ids: fileIds,
    folder_ids: folderIds ?? [],
  });
}

export async function bulkMove(fileIds: string[], folderIds: string[], folderId: string | null): Promise<void> {
  await api.post('/fileserver-v1/api/files/bulk/move/', {
    file_ids: fileIds,
    folder_ids: folderIds,
    folder_id: folderId,
  });
}

export async function bulkStar(fileIds: string[], starred: boolean): Promise<void> {
  await api.post('/fileserver-v1/api/files/bulk/star/', {
    file_ids: fileIds,
    starred,
  });
}
