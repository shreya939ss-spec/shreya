import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, getSessionId } from '../lib/supabase';

export interface NaradUser {
  id: string;
  session_id: string;
  phone?: string;
  email?: string;
  full_name?: string;
  login_method: 'phone' | 'email' | 'guest' | 'officer';
  preferred_language?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_officer?: boolean;
}

interface AuthContextValue {
  user: NaradUser | null;
  loading: boolean;
  loginPhone: (phone: string, name: string) => Promise<void>;
  loginEmail: (email: string, password: string, name?: string) => Promise<void>;
  loginGuest: () => Promise<void>;
  loginOfficer: (code: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<NaradUser>) => Promise<void>;
  pendingPhone: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NaradUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    const timeout = setTimeout(() => setLoading(false), 3000);
    try {
      const sessionId = getSessionId();
      const { data } = await supabase
        .from('narad_users')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (data) {
        setUser(data as NaradUser);
      }
    } catch (e) {
      console.error('Session restore failed', e);
    }
    clearTimeout(timeout);
    setLoading(false);
  }

  async function createUserRecord(method: NaradUser['login_method'], extra: Partial<NaradUser> = {}) {
    const sessionId = getSessionId();
    const { data, error } = await supabase
      .from('narad_users')
      .upsert({
        session_id: sessionId,
        login_method: method,
        preferred_language: localStorage.getItem('narad-lang') || 'en',
        ...extra,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (data) setUser(data as NaradUser);
  }

  async function loginPhone(phone: string, name: string) {
    setPendingPhone(phone);
    await createUserRecord('phone', { phone, full_name: name });
  }

  async function verifyOtp(_otp: string) {
    // Simulated OTP verification — any 6-digit code accepted
    setPendingPhone(null);
  }

  async function loginEmail(email: string, password: string, name?: string) {
    await createUserRecord('email', { email, full_name: name || email.split('@')[0] });
  }

  async function loginGuest() {
    await createUserRecord('guest', { full_name: 'Guest User' });
  }

  async function loginOfficer(code: string) {
    // Accept any code starting with "NARAD-" for demo
    if (!code.startsWith('NARAD-')) throw new Error('Invalid officer code');
    await createUserRecord('officer', { full_name: 'Officer', is_officer: true });
  }

  async function updateProfile(updates: Partial<NaradUser>) {
    if (!user) return;
    const { data, error } = await supabase
      .from('narad_users')
      .update(updates)
      .eq('session_id', user.session_id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (data) setUser(data as NaradUser);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('narad-session-id');
    localStorage.removeItem('narad-guest-id');
  }

  return (
    <AuthContext.Provider value={{
      user, loading, loginPhone, loginEmail, loginGuest, loginOfficer,
      verifyOtp, logout, updateProfile, pendingPhone,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
