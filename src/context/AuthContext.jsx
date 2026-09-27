/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);
const KEY = 'aw-auth';
const AUTH_EVENT = 'aw-auth-changed';

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

function announce() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored);

  const value = useMemo(
    () => ({
      user,
      isAuthed: Boolean(user),
      async login({ name, email, password, remember = true }) {
        try {
          const { user: u } = await api.login({ email, password, remember });
          setUser({ ...u, remember });
          persist({ ...u, remember });
          announce();
          return { user: u };
        } catch (e) {
          if (e.status) throw e; // real auth error, show it
        }
        // API unreachable → browser-only demo session
        const u = {
          name: (name || '').trim() || nameFromEmail(email),
          email,
          remember,
          demo: true,
        };
        setUser(u);
        persist(u);
        announce();
        return { user: u, demo: true };
      },
      async signup({ name, email, password, remember = true }) {
        try {
          const { user: u } = await api.signup({ name, email, password, remember });
          setUser({ ...u, remember });
          persist({ ...u, remember });
          announce();
          return { user: u };
        } catch (e) {
          if (e.status) throw e;
        }
        const u = {
          name: (name || '').trim() || nameFromEmail(email),
          email,
          remember,
          demo: true,
        };
        setUser(u);
        persist(u);
        announce();
        return { user: u, demo: true };
      },
      async logout() {
        try {
          await api.logout();
        } catch {
          /* offline */
        }
        setUser(null);
        persist(null);
        announce();
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
