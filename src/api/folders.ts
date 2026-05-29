import { api } from './fileserver';

export interface FolderResponse {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface FolderDetail extends FolderResponse {
  breadcrumb: { id: string | null; name: string }[];
  children: FolderResponse[];
}

export async function listFolders(parentId?: string | null): Promise<FolderResponse[]> {
  const params = parentId != null ? { parent_id: parentId } : {};
  const { data } = await api.get<FolderResponse[]>('/fileserver-v1/api/folders/', { params });
  return data;
}

export async function createFolder(name: string, parentId?: string | null): Promise<FolderResponse> {
  const { data } = await api.post<FolderResponse>('/fileserver-v1/api/folders/', {
    name,
    parent_id: parentId ?? null,
  });
  return data;
}

export async function getFolder(id: string): Promise<FolderDetail> {
  const { data } = await api.get<FolderDetail>(`/fileserver-v1/api/folders/${id}/`);
  return data;
}

export async function renameFolder(id: string, name: string): Promise<FolderResponse> {
  const { data } = await api.patch<FolderResponse>(`/fileserver-v1/api/folders/${id}/rename/`, { name });
  return data;
}

export async function moveFolder(id: string, parentId: string | null): Promise<FolderResponse> {
  const { data } = await api.patch<FolderResponse>(`/fileserver-v1/api/folders/${id}/move/`, {
    parent_id: parentId,
  });
  return data;
}

export async function trashFolder(id: string): Promise<void> {
  await api.delete(`/fileserver-v1/api/folders/${id}/`);
}

export async function restoreFolder(id: string): Promise<void> {
  await api.post(`/fileserver-v1/api/folders/${id}/restore/`);
}

export async function permanentDeleteFolder(id: string): Promise<void> {
  await api.delete(`/fileserver-v1/api/folders/${id}/permanent/`);
}
