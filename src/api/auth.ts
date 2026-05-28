import axios from 'axios';
import { getRefreshToken, saveTokens, clearTokens } from '../store/useAuthStore';
import type { AuthUser } from '../store/useAuthStore';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface AuthResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${BASE}/fileserver-v1/api/auth/register/`, { email, password, name });
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${BASE}/fileserver-v1/api/auth/login/`, { email, password });
  return data;
}

export async function googleLogin(credential: string): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${BASE}/fileserver-v1/api/auth/google/`, { credential });
  return data;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const { data } = await axios.post<{ access: string }>(`${BASE}/fileserver-v1/api/auth/refresh/`, { refresh });
    const stored = JSON.parse(localStorage.getItem('fs_user') ?? 'null');
    if (stored) saveTokens(data.access, refresh, stored);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}
