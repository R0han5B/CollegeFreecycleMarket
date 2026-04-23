'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ItemCard from '@/components/marketplace/ItemCard';
import { Button } from '@/components/ui/button';
import { PlusSquare } from 'lucide-react';
import type { Item } from '@/types';

export default function MyItemsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      fetchMyItems();
    }
  }, [mounted, isLoading, isAuthenticated, user?.id, router]);

  const fetchMyItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/my-items?userId=${user?.id}`);
      const data = await response.json();
      if (response.ok) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="page-loader" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    { value: items.length, label: 'Total Items', tone: 'text-slate-900' },
    { value: items.filter((i) => !i.isSold).length, label: 'Available', tone: 'text-emerald-500' },
    { value: items.filter((i) => i.price === 0).length, label: 'Free Items', tone: 'text-orange-500' },
    { value: items.filter((i) => i.isSold).length, label: 'Sold', tone: 'text-red-400' },
  ];

  return (
    <div className="page-shell flex flex-col">
      <Header />

      <main className="flex-1 page-section">
        <div className="page-container space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="section-badge mb-3">Inventory</div>
              <h1 className="section-title">My items</h1>
              <p className="section-copy">Manage every listing you have posted and keep track of what is still available.</p>
            </div>
            <Button onClick={() => router.push('/post-item')}>
              <PlusSquare className="h-5 w-5" />
              Post New Item
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="premium-card rounded-[1.5rem] p-6">
                <p className={`text-3xl font-bold ${stat.tone}`}>{stat.value}</p>
                <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white/80">
              <div className="page-loader" />
            </div>
          ) : items.length === 0 ? (
            <div className="premium-card rounded-[2rem] px-6 py-14 text-center">
              <h3 className="text-2xl font-semibold text-slate-900">No listings yet</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
                Your posted items will appear here as soon as you create your first listing.
              </p>
              <Button className="mt-6" onClick={() => router.push('/post-item')}>
                <PlusSquare className="h-5 w-5" />
                Post Your First Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
