import axios from 'axios';
import { api } from './fileserver';
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

export async function forgotPassword(email: string): Promise<void> {
  await axios.post(`${BASE}/fileserver-v1/api/auth/forgot-password/`, { email });
}

export async function resetPassword(uid: string, token: string, password: string): Promise<void> {
  await axios.post(`${BASE}/fileserver-v1/api/auth/reset-password/`, { uid, token, password });
}

export async function updateProfile(data: { name?: string; email?: string }): Promise<AuthUser> {
  const { data: user } = await api.patch<AuthUser>('/fileserver-v1/api/auth/me/', data);
  return user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('/fileserver-v1/api/auth/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
  });
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
