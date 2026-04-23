'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import LoginForm from '@/components/auth/LoginForm';
import { ShoppingBag, Recycle, Users, ShieldCheck, ArrowRight, MessageSquare, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

const featureCards = [
  {
    icon: Recycle,
    title: 'Sustainable by default',
    copy: 'Give textbooks, gadgets, furniture, and daily essentials a second life on campus.',
  },
  {
    icon: Users,
    title: 'Built for your community',
    copy: 'Connect only with verified RKNEC students and staff inside one trusted marketplace.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure and verified',
    copy: 'College email verification and account-gated browsing keep the platform community-first.',
  },
];

const highlightStats = [
  { value: 'Campus Only', label: 'Verified community access' },
  { value: 'Real-Time', label: 'Chat between buyers and sellers' },
  { value: 'Zero Waste', label: 'Reshare what still has value' },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated) {
      router.push('/dashboard');
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
    <div className="page-shell overflow-x-hidden">
      <main>
        <section className="page-section relative overflow-hidden pt-10 md:pt-16">
          <div className="page-container">
            <div className="glass-panel top-grid-glow relative overflow-hidden rounded-[2rem] px-6 py-6 md:px-8">
              <div className="mb-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-orange-500 p-3 shadow-[0_8px_20px_rgba(249,115,22,0.18)]">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">College Freecycle Market</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <Button variant="ghost" onClick={() => router.push('/login')}>
                    Log In
                  </Button>
                  <Button onClick={() => router.push('/signup')}>Create Account</Button>
                </div>
              </div>

              <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div className="relative space-y-8">
                  <div className="animate-enter space-y-5">
                    <div className="section-badge">Campus marketplace</div>
                    <h1 className="hero-title max-w-4xl">
                      Buy, sell, and donate within your <span className="gradient-text">college community</span>.
                    </h1>
                    <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                      Find textbooks, electronics, room essentials, and everyday items from people on your campus. Everything stays simple, local, and easier to trust.
                    </p>
                  </div>

                  <div className="animate-enter-delay-1 flex flex-wrap gap-3">
                    <Button size="lg" onClick={() => router.push('/signup')}>
                      Start Browsing
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
                      Already a member
                    </Button>
                  </div>

                  <div className="animate-enter-delay-2 grid gap-4 sm:grid-cols-3">
                    {highlightStats.map((stat) => (
                      <div key={stat.label} className="premium-card rounded-[1.5rem] p-5">
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="animate-enter-delay-3 flex justify-center lg:justify-end">
                  <LoginForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-container">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: ShieldCheck, label: 'Verified community', copy: 'College-only access' },
                { icon: MessageSquare, label: 'Instant messaging', copy: 'Coordinate faster' },
                { icon: HeartHandshake, label: 'Community reuse', copy: 'Less waste, more value' },
                { icon: Recycle, label: 'Smart freecycling', copy: 'Sell or donate easily' },
              ].map((item) => (
                <div key={item.label} className="premium-card rounded-[1.5rem] p-5">
                  <item.icon className="h-5 w-5 text-orange-500" />
                  <p className="mt-4 font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-container">
            <div className="mb-8 space-y-3">
              <div className="section-badge">Why it works</div>
              <h2 className="section-title">A familiar product, now with a stronger visual identity</h2>
              <p className="section-copy">
                The platform still does the same core jobs: sign in securely, browse listings, post items, and message sellers. The difference is a cleaner interface that feels more welcoming and easier to use.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {featureCards.map((feature) => (
                <div key={feature.title} className="premium-card rounded-[1.8rem] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
