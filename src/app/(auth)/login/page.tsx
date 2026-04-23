'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import LoginForm from '@/components/auth/LoginForm';
import { ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading || isAuthenticated) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="page-loader" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <main className="page-section flex min-h-screen items-center">
        <div className="page-container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="rounded-2xl bg-orange-500 p-3 shadow-[0_8px_20px_rgba(249,115,22,0.18)]">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">College Freecycle Market</p>
              </div>
            </Link>

            <div className="space-y-5">
              <div className="section-badge">Secure return</div>
              <h1 className="hero-title max-w-3xl">
                Pick up where you left off with a <span className="gradient-text">cleaner campus marketplace</span>.
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-600">
                Browse active listings, reconnect with buyers and sellers, and keep useful items circulating inside the RKNEC community.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Verified college email sign-in',
                'Live messaging for pickups',
                'Saved watchlist and item tracking',
                'Fast listing and posting flow',
              ].map((item) => (
                <div key={item} className="premium-card rounded-[1.5rem] p-4 text-sm text-slate-600">
                  <Sparkles className="mb-3 h-4 w-4 text-orange-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <LoginForm />
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                Access remains limited to verified RKNEC members.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
