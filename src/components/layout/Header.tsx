'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, LogOut, User, PlusSquare, LayoutDashboard, Menu, X, MessageSquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch unread message count
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

  // Initialize Socket.io for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Connect to Socket.io server
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to notification server');
      socket.emit('user:join', user.id);
    });

    // Listen for new messages
    socket.on('message:receive', (data: any) => {
      // If the message is received by current user, increment unread count
      if (data.receiverId === user.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socketRef.current = socket;

    // Initial fetch
    fetchUnreadCount();

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  // Refresh unread count when navigating
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [pathname, isAuthenticated]);

  if (pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">
              College Freecycling
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/dashboard">
                <Button
                  variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                  className={pathname === '/dashboard' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </Link>
              <Link href="/post-item">
                <Button
                  variant={pathname === '/post-item' ? 'default' : 'ghost'}
                  className={pathname === '/post-item' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  <PlusSquare className="h-4 w-4 mr-2" />
                  Post Item
                </Button>
              </Link>
              <Link href="/my-items">
                <Button
                  variant={pathname === '/my-items' ? 'default' : 'ghost'}
                  className={pathname === '/my-items' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  My Items
                </Button>
              </Link>
              <Link href="/messages">
                <Button
                  variant={pathname === '/messages' ? 'default' : 'ghost'}
                  className={pathname === '/messages' ? 'bg-orange-500 hover:bg-orange-600' : 'relative'}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant={pathname === '/profile' ? 'default' : 'ghost'}
                  className={pathname === '/profile' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </nav>
          )}

          {/* User Actions */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-sm text-gray-600 mr-2">
                <span className="font-medium">{user?.name || user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && isAuthenticated && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Browse Items
                </Button>
              </Link>
              <Link href="/post-item" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname === '/post-item' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <PlusSquare className="h-4 w-4 mr-2" />
                  Post Item
                </Button>
              </Link>
              <Link href="/my-items" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname === '/my-items' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  My Items
                </Button>
              </Link>
              <Link href="/messages" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname === '/messages' ? 'default' : 'ghost'}
                  className="w-full justify-start relative"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname === '/profile' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <div className="pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2 px-2">
                  {user?.name || user?.email}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
