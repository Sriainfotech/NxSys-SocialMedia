import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBillingStore } from '@/stores/billingStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  CalendarDays,
  Link2,
  LogOut,
  Menu,
  X,
  FileText,
  CreditCard,
  Zap,
  ArrowUpRight,
  PanelLeftClose,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/dashboard/posts', label: 'Posts', icon: PenSquare },
  { to: '/dashboard/scheduled', label: 'Scheduled Posts', icon: Calendar },
  { to: '/dashboard/drafts', label: 'Drafts', icon: FileText },
  { to: '/dashboard/accounts', label: 'Connected Accounts', icon: Link2 },
  { to: '/dashboard/billing', label: 'Billing & Credits', icon: CreditCard },
];

const pageTitleFor = (pathname: string) => {
  const exact = navItems.find((n) => n.to === pathname);
  if (exact) return exact.label;
  const prefix = navItems
    .filter((n) => n.to !== '/dashboard')
    .find((n) => pathname.startsWith(n.to));
  return prefix?.label ?? 'Dashboard';
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const LG_BREAKPOINT = 1024;

const isDesktopViewport = () =>
  typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT;

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuthStore();
  const { usage, subscription, fetchUsage, fetchSubscription } = useBillingStore();
  const navigate = useNavigate();
  const location = useLocation();

  // isDesktop tracks whether we're at >= lg. sidebarOpen controls visibility at
  // every size: drawer on mobile, persistent on desktop.
  const [isDesktop, setIsDesktop] = useState(isDesktopViewport);
  const [sidebarOpen, setSidebarOpen] = useState(isDesktopViewport);

  // React to viewport changes — auto-open on desktop, auto-close on mobile.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    const handle = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(e.matches);
      setSidebarOpen(e.matches);
    };
    // initial sync in case SSR/hydration mismatches
    handle(mq);
    if (mq.addEventListener) {
      mq.addEventListener('change', handle as (e: MediaQueryListEvent) => void);
      return () => mq.removeEventListener('change', handle as (e: MediaQueryListEvent) => void);
    }
    // Safari < 14 fallback
    mq.addListener(handle as (e: MediaQueryListEvent) => void);
    return () => mq.removeListener(handle as (e: MediaQueryListEvent) => void);
  }, []);

  useEffect(() => {
    fetchUsage().catch(() => {});
    fetchSubscription().catch(() => {});
  }, [fetchUsage, fetchSubscription]);

  // Close the drawer on route change when we're on mobile.
  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (!isDesktop) setSidebarOpen(false);
  };

  const currentTitle = pageTitleFor(location.pathname);

  const creditsRemaining = Number(usage?.credits_remaining ?? 0);
  const creditsTotal = Number(usage?.credits_total ?? 0);
  const creditsPct =
    creditsTotal > 0 ? Math.max(0, Math.min(100, (creditsRemaining / creditsTotal) * 100)) : 0;
  const planLabel = subscription?.plan?.name || subscription?.plan_name || 'Free plan';

  const showOverlay = !isDesktop && sidebarOpen;
  const asideVisible = sidebarOpen;

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Mobile backdrop */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Primary"
        aria-hidden={!sidebarOpen}
        className={cn(
          'bg-sidebar flex flex-col overflow-hidden',
          // Mobile: fixed drawer that slides
          'fixed inset-y-0 left-0 z-50 w-64',
          'transition-transform duration-300 ease-out',
          asideVisible ? 'translate-x-0' : '-translate-x-full',
          // Desktop: becomes part of the flex layout; width toggles 0 ↔ 16rem
          'lg:static lg:h-screen lg:translate-x-0 lg:shrink-0',
          'lg:transition-[width] lg:duration-300 lg:ease-out',
          asideVisible ? 'lg:w-64' : 'lg:w-0'
        )}
      >
        {/* Inner wrapper keeps content at fixed width during the width animation */}
        <div className="relative w-64 h-full flex flex-col">
          {/* Gradient orbs */}
          <div className="pointer-events-none absolute -top-24 -left-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-gradient-to-br from-blue-400/15 to-blue-500/5 blur-3xl" />

          <div className="relative flex items-center gap-3 px-6 h-14 sm:h-16 border-b border-sidebar-border">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <img src="/logo.png" alt="SocialHub" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-sidebar-primary-foreground tracking-tight truncate">
              SocialHub
            </span>
            <button
              className="ml-auto text-sidebar-foreground hover:text-white transition-colors rounded-lg p-1"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              title={isDesktop ? 'Collapse sidebar' : 'Close'}
            >
              {isDesktop ? <PanelLeftClose className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-600/90 via-blue-600/90 to-blue-500/80 shadow-md shadow-blue-500/30'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive
                          ? 'text-white'
                          : 'text-sidebar-foreground group-hover:text-white'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Credits widget */}
          <div className="relative px-3 pb-3">
            <Link
              to="/dashboard/billing"
              onClick={handleNavClick}
              className="group block rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-400/15 border border-white/10 p-3 hover:from-blue-500/25 hover:via-blue-500/25 hover:to-blue-500/25 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md shadow-blue-500/40 shrink-0">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                      Posts left
                    </p>
                    <p className="text-sm font-bold text-white tabular-nums leading-tight truncate">
                      {creditsRemaining.toLocaleString()}
                      {creditsTotal > 0 && (
                        <span className="text-white/50 font-normal"> / {creditsTotal.toLocaleString()}</span>
                      )}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-300"
                  style={{ width: `${creditsPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-white/60 truncate">{planLabel}</p>
            </Link>
          </div>

          <div className="relative px-3 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 mb-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-sm font-semibold text-white shadow-md shadow-blue-500/30 shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-primary-foreground truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-white w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 sm:h-16 border-b border-slate-200/70 flex items-center px-3 sm:px-4 lg:px-6 bg-white/80 backdrop-blur-xl sticky top-0 z-30 gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate min-w-0">
            {currentTitle}
          </h1>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Link
              to="/dashboard/billing"
              className="inline-flex items-center gap-1.5 sm:gap-2 h-9 px-2.5 sm:px-3 rounded-full border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm hover:shadow-blue-500/10 transition-all group"
            >
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shrink-0">
                <Zap className="w-3 h-3 text-white" />
              </span>
              <span className="text-xs font-semibold text-slate-900 tabular-nums">
                {creditsRemaining.toLocaleString()}
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">posts</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto page-bg">
          <div className="p-3 sm:p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
