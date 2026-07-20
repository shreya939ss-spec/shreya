import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Globe, Shield, LogOut, ChevronRight, Info, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { useScanHistory } from '../lib/hooks';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, lang } = useLang();
  const { items: scans } = useScanHistory(user?.session_id);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (user?.session_id) {
      supabase
        .from('emergency_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', user.session_id)
        .then(({ count }) => setAlertCount(count || 0));
    }
  }, [user?.session_id]);

  const loginMethodIcon = {
    phone: Phone,
    email: Mail,
    guest: User,
    officer: Shield,
  };
  const Icon = loginMethodIcon[user?.login_method || 'guest'];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="glass-strong rounded-2xl p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-narad-primary/20 to-narad-primary/5 flex items-center justify-center mx-auto mb-4 border border-narad-primary/30">
          <User size={36} className="text-narad-primary" />
        </div>
        <h1 className="text-xl font-bold text-narad-text">{user?.full_name || 'Guest User'}</h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Icon size={14} className="text-narad-muted" />
          <span className="text-sm text-narad-muted capitalize">
            {user?.login_method === 'officer' ? t('officer') :
             user?.login_method === 'guest' ? t('guestUser') : t('member')}
          </span>
        </div>
        {user?.phone && <p className="text-xs text-narad-muted mt-1">{user.phone}</p>}
        {user?.email && <p className="text-xs text-narad-muted">{user.email}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold text-narad-primary">{scans.length}</div>
          <div className="text-xs text-narad-muted">{t('scanHistory')}</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-narad-success">{alertCount}</div>
          <div className="text-xs text-narad-muted">Alerts Sent</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-narad-accent">{lang.toUpperCase()}</div>
          <div className="text-xs text-narad-muted">{t('language')}</div>
        </div>
      </div>

      {/* Settings list */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-narad-border">
          <div className="flex items-center gap-3">
            <Globe size={20} className="text-narad-primary" />
            <span className="text-sm text-narad-text">{t('language')}</span>
          </div>
          <LanguageToggle />
        </div>

        {user?.emergency_contact_name && (
          <div className="p-4 flex items-center justify-between border-b border-narad-border">
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-emerald-400" />
              <div>
                <div className="text-sm text-narad-text">{user.emergency_contact_name}</div>
                <div className="text-xs text-narad-muted">{user.emergency_contact_phone}</div>
              </div>
            </div>
          </div>
        )}

        <button className="w-full p-4 flex items-center justify-between border-b border-narad-border hover:bg-narad-card transition-colors">
          <div className="flex items-center gap-3">
            <History size={20} className="text-narad-muted" />
            <span className="text-sm text-narad-text">{t('scanHistory')}</span>
          </div>
          <ChevronRight size={18} className="text-narad-muted" />
        </button>

        <button className="w-full p-4 flex items-center justify-between border-b border-narad-border hover:bg-narad-card transition-colors">
          <div className="flex items-center gap-3">
            <Info size={20} className="text-narad-muted" />
            <span className="text-sm text-narad-text">{t('aboutNarad')}</span>
          </div>
          <ChevronRight size={18} className="text-narad-muted" />
        </button>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info size={20} className="text-narad-muted" />
            <span className="text-sm text-narad-text">{t('version')}</span>
          </div>
          <span className="text-xs text-narad-muted">1.0.0</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate('/'); }}
        className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-narad-danger hover:bg-narad-danger/10 transition-all"
      >
        <LogOut size={20} />
        <span className="text-sm font-medium">{t('logout')}</span>
      </button>

      <p className="text-center text-xs text-narad-muted/50 pb-4">
        NARAD • नारद • Made in India 🇮🇳
      </p>
    </div>
  );
}
