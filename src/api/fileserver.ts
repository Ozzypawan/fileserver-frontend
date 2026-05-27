import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({ baseURL: BASE });

export interface UploadResponse {
  name: string;
  size: number;
  content_type: string;
  extension: string;
  url: string;
  path: string;
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
