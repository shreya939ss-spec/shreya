import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'implicit',
    storage: window.localStorage,
    storageKey: 'narad-auth',
  },
});

export const getSessionId = (): string => {
  const key = 'narad-session-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};

export const getGuestId = (): string => {
  const key = 'narad-guest-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = 'guest_' + crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};
