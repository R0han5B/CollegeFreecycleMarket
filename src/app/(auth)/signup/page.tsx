'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import SignupForm from '@/components/auth/SignupForm';
import { ShoppingBag, MailCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
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
        <div className="page-container grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
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
              <div className="section-badge">Join the network</div>
              <h1 className="hero-title max-w-3xl">
                Turn spare items into opportunities with a <span className="gradient-text">verified campus account</span>.
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-600">
                Create your profile, verify your RKNEC email, and unlock a fast way to buy, sell, or donate things that still matter.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                'Verify your RKNEC email with OTP',
                'List textbooks, gadgets, and essentials in minutes',
                'Message buyers and sellers in real time',
              ].map((item) => (
                <div key={item} className="premium-card rounded-[1.5rem] p-4 text-sm text-slate-600">
                  <Sparkles className="mb-3 h-4 w-4 text-orange-500" />
                  {item}
                </div>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <MailCheck className="h-4 w-4 text-orange-500" />
              Only college email addresses can join the marketplace.
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <SignupForm />
          </div>
        </div>
      </main>
    </div>
  );
}
