'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  LogOut,
  User,
  PlusSquare,
  LayoutDashboard,
  Menu,
  X,
  MessageSquare,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastScrollY = useRef(0);

  const navItems = [
    { href: '/dashboard', label: 'Browse', icon: LayoutDashboard },
    { href: '/post-item', label: 'Post Item', icon: PlusSquare },
    { href: '/my-items', label: 'My Items', icon: ShoppingBag },
    { href: '/messages', label: 'Messages', icon: MessageSquare, count: unreadCount },
    { href: '/cart', label: 'Saved', icon: ShoppingCart, count: cartCount },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/messages/unread-count?userId=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchCartCount = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/watchlist?userId=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setCartCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 10);
      setHidden(current > lastScrollY.current && current > 120);
      lastScrollY.current = current;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const socket = io(undefined, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('user:join', user.id);
    });

    socket.on('message:receive', (data: { receiverId?: string }) => {
      if (data.receiverId === user.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socketRef.current = socket;
    const initialFetchTimeout = window.setTimeout(() => {
      void fetchUnreadCount();
      void fetchCartCount();
    }, 0);

    return () => {
      window.clearTimeout(initialFetchTimeout);
      socket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshTimeout = window.setTimeout(() => {
      void fetchUnreadCount();
      void fetchCartCount();
    }, 0);

    return () => window.clearTimeout(refreshTimeout);
  }, [pathname, isAuthenticated]);

  if (pathname === '/') {
    return null;
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-50 transition-transform duration-300',
        hidden ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <header
        className={cn(
          'border-b border-slate-200/80 bg-white/95 backdrop-blur-xl transition-all duration-300',
          scrolled && 'shadow-[0_10px_28px_rgba(15,23,42,0.08)]'
        )}
      >
        <div className="page-container px-4">
          <div className="flex h-18 items-center justify-between gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-500 p-3 shadow-[0_8px_20px_rgba(249,115,22,0.18)]">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-slate-900">College Freecycle Market</p>
              </div>
            </Link>

            {isAuthenticated && (
              <nav className="hidden xl:flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                          'rounded-full px-4',
                          !active && 'text-slate-700',
                          active && 'shadow-[0_8px_20px_rgba(249,115,22,0.18)]'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        {!!item.count && <Badge className="ml-1">{item.count}</Badge>}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            )}

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <div className="hidden lg:flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Logged In</p>
                    <p className="max-w-[150px] truncate font-medium text-slate-900">
                      {user?.name || user?.email}
                    </p>
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                className="xl:hidden"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && isAuthenticated && (
            <div className="pb-4 xl:hidden">
              <div className="glass-panel rounded-[1.75rem] p-3">
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{user?.name || user?.email}</p>
                    <p className="text-sm text-slate-500">Campus marketplace access active</p>
                  </div>
                </div>

                <nav className="grid gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={active ? 'default' : 'ghost'}
                          className="w-full justify-between rounded-2xl"
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </span>
                          {!!item.count && <Badge>{item.count}</Badge>}
                        </Button>
                      </Link>
                    );
                  })}
                  <Button variant="outline" className="mt-2 w-full justify-center rounded-2xl" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
