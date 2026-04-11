'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import LoginForm from '@/components/auth/LoginForm';
import { ShoppingBag, Recycle, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isLoading) return;

    if (isAuthenticated && !redirected) {
      setRedirected(true);
      router.push('/dashboard');
    }
  }, [mounted, isLoading, isAuthenticated, redirected, router]);

  // Don't render anything while loading or if we've redirected
  if (!mounted || isLoading || redirected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-3 rounded-xl">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                College Freecycling Market
              </h1>
            </div>
            <p className="text-xl text-gray-600">
              Give items a second life. Buy, sell, or donate items within your college community.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                Start Browsing
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Use Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Recycle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Sustainable</h3>
              <p className="text-gray-600">
                Reduce waste by giving items a second life within our community
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Community Focused</h3>
              <p className="text-gray-600">
                Connect with fellow students and staff in a trusted environment
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Safe & Secure</h3>
              <p className="text-gray-600">
                Only verified college emails allowed. Your transactions are protected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Sign Up</h3>
              <p className="text-gray-600">
                Create an account using your college email (@rknec.edu)
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Browse & Post</h3>
              <p className="text-gray-600">
                Explore items or list your own for free or for credits
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Connect & Trade</h3>
              <p className="text-gray-600">
                Message sellers, arrange meetups, and complete transactions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2026 College Freecycling Market. All rights reserved.</p>
          <p className="mt-2">A sustainable marketplace for students</p>
        </div>
      </footer>
    </div>
  );
}
