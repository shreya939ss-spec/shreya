import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Shield, ScanLine, PhoneCall, ShieldAlert,
  MessageSquareWarning, Network, Map, User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import NaradLogo from './NaradLogo';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' as const },
  { path: '/kuber-shield', icon: Shield, key: 'kuberShield' as const },
  { path: '/pramaan', icon: ScanLine, key: 'pramaan' as const },
  { path: '/aakashvani', icon: PhoneCall, key: 'aakashvani' as const },
  { path: '/rakshak-ping', icon: ShieldAlert, key: 'rakshakPing' as const },
  { path: '/trinetra', icon: MessageSquareWarning, key: 'trinetra' as const },
  { path: '/sutra', icon: Network, key: 'sutra' as const },
  { path: '/command', icon: Map, key: 'command' as const },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLang();
  const isGuest = user?.login_method === 'guest';

  return (
    <div className="min-h-screen bg-narad-bg grid-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass-strong border-r border-narad-border p-4 fixed h-full z-50">
        <Link to="/dashboard" className="flex items-center gap-3 mb-8 px-2">
          <NaradLogo size={40} />
          <div>
            <div className="font-display font-black text-lg text-narad-primary tracking-wider">NARAD</div>
            <div className="font-deva text-xs text-narad-muted">नारद</div>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-narad-primary/10 text-narad-primary border border-narad-primary/30'
                    : 'text-narad-muted hover:text-narad-text hover:bg-narad-card'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 pt-4 border-t border-narad-border">
          <div className="flex items-center gap-2">
            <LanguageToggle />
          </div>
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-narad-muted hover:text-narad-text hover:bg-narad-card transition-all">
            <User size={20} />
            <span className="text-sm font-medium">{t('profile')}</span>
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-narad-muted hover:text-narad-danger transition-all">
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 pb-24 lg:pb-0">
        {/* Guest Banner */}
        {isGuest && (
          <div className="bg-narad-accent/10 border-b border-narad-accent/30 px-4 py-2 text-center text-sm text-narad-accent">
            {t('guestBanner')}
          </div>
        )}

        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-40 glass-strong border-b border-narad-border px-4 py-3 flex items-center justify-between safe-top">
          <Link to="/dashboard" className="flex items-center gap-2">
            <NaradLogo size={32} />
            <div>
              <span className="font-display font-black text-base text-narad-primary tracking-wider">NARAD</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle compact />
            <Link to="/profile" className="glass rounded-xl p-2">
              <User size={18} className="text-narad-primary" />
            </Link>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-6xl mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-narad-border safe-bottom">
        <div className="flex items-center justify-around px-2 py-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${active ? 'nav-item-active' : ''} min-w-[60px]`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
