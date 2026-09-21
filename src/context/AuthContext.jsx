/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const KEY = 'aw-auth';

function nameFromEmail(email) {
  const local = (email || '').split('@')[0] || '';
  const clean = local.replace(/[._-]+/g, ' ').trim();
  if (!clean) return 'Guest';
  return clean
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function readStored() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

function persist(user) {
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
    if (!user) return;
    const target = user.remember ? localStorage : sessionStorage;
    target.setItem(KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored);

  const value = useMemo(
    () => ({
      user,
      isAuthed: Boolean(user),
      login({ name, email, remember = true }) {
        const u = { name: (name || '').trim() || nameFromEmail(email), email, remember };
        setUser(u);
        persist(u);
      },
      signup({ name, email, remember = true }) {
        const u = { name: (name || '').trim() || nameFromEmail(email), email, remember };
        setUser(u);
        persist(u);
      },
      logout() {
        setUser(null);
        persist(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
