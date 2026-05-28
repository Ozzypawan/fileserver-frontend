import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../store/useAuthStore';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({ baseURL: BASE });

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
      if (!refreshing) {
        const refresh = getRefreshToken();
        refreshing = refresh
          ? axios.post<{ access: string }>(`${BASE}/fileserver-v1/api/auth/refresh/`, { refresh })
              .then(r => {
                const stored = JSON.parse(localStorage.getItem('fs_user') ?? 'null');
                if (stored) saveTokens(r.data.access, refresh, stored);
                return r.data.access;
              })
              .catch(() => { clearTokens(); return null; })
              .finally(() => { refreshing = null; })
          : Promise.resolve(null);
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
  name: string;
  size: number;
  content_type: string;
  extension: string;
  url: string;
  path: string;
  uploadedAt?: string;
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

export async function listFiles(): Promise<(UploadResponse & { uploadedAt?: string })[]> {
  const { data } = await api.get('/fileserver-v1/api/files/list/');
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
