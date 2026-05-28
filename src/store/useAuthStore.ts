import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

const ACCESS_KEY  = 'fs_access';
const REFRESH_KEY = 'fs_refresh';
const USER_KEY    = 'fs_user';

export function getAccessToken()  { return localStorage.getItem(ACCESS_KEY); }
export function getRefreshToken() { return localStorage.getItem(REFRESH_KEY); }

export function saveTokens(access: string, refresh: string, user: AuthUser) {
  localStorage.setItem(ACCESS_KEY,  access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function loadUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); }
  catch { return null; }
}

// ── Module-level singleton so all hook callers share the same state ──
let _user: AuthUser | null = loadUser();
const _listeners = new Set<() => void>();
const _notify = () => _listeners.forEach(fn => fn());

export function useAuthStore() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const tick = () => rerender(n => n + 1);
    _listeners.add(tick);
    return () => { _listeners.delete(tick); };
  }, []);

  const login = useCallback((access: string, refresh: string, u: AuthUser) => {
    saveTokens(access, refresh, u);
    _user = u;
    _notify();
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    _user = null;
    _notify();
  }, []);

  return { user: _user, login, logout, isAuthenticated: !!_user };
}
