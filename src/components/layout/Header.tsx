'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, LogOut, User, PlusSquare, LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                  {user?.credits} credits
                </span>
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
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    {user?.credits} credits
                  </span>
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
