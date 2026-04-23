'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { getPrimaryItemImage } from '@/lib/utils';
import { Trash2, ShoppingCart, MessageCircle } from 'lucide-react';
import type { Watchlist } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.id) {
      fetchWatchlist();
    }
  }, [mounted, isLoading, isAuthenticated, router, user?.id]);

  const fetchWatchlist = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/watchlist?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setWatchlist(data.watchlist);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!user?.id) return;

    setRemovingId(itemId);
    try {
      const response = await fetch(`/api/watchlist/${itemId}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWatchlist((current) => current.filter((entry) => entry.itemId !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    } finally {
      setRemovingId(null);
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

  return (
    <div className="page-shell flex flex-col">
      <Header />

      <main className="flex-1 page-section">
        <div className="page-container space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="section-badge mb-3">Saved for later</div>
              <h1 className="section-title">Saved cart</h1>
              <p className="section-copy">Items you want to revisit stay here until you are ready to contact the seller.</p>
            </div>
            <Badge variant="outline" className="px-4 py-2 text-sm normal-case tracking-normal">
              {watchlist.length} item{watchlist.length === 1 ? '' : 's'}
            </Badge>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white/80">
              <div className="page-loader" />
            </div>
          ) : watchlist.length === 0 ? (
            <div className="premium-card rounded-[2rem] p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Your cart is empty</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
                Save any listing and it will appear here for quick access later.
              </p>
              <Button className="mt-6" onClick={() => router.push('/dashboard')}>
                Browse Items
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {watchlist.map((entry) => {
                const item = entry.item;
                if (!item) return null;

                const primaryImage = getPrimaryItemImage(item);

                return (
                  <Card key={entry.id} className="premium-card overflow-hidden py-0">
                    <div
                      className="relative aspect-video cursor-pointer overflow-hidden bg-linear-to-br from-orange-50 via-white to-slate-50"
                      onClick={() => router.push(`/item/${item.id}`)}
                    >
                      <ImageFallback
                        src={primaryImage}
                        alt={item.title}
                        fill
                        className="object-contain p-4 transition-transform duration-500 hover:scale-110"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-5xl font-bold text-slate-600">{item.title.charAt(0)}</span>
                          </div>
                        }
                      />
                      {item.isSold && <Badge variant="destructive" className="absolute left-3 top-3">Sold</Badge>}
                    </div>

                    <CardContent className="flex-1 space-y-3 p-5">
                      <div>
                        <h2 className="line-clamp-2 text-xl font-semibold text-slate-900">{item.title}</h2>
                        <p className="mt-2 font-bold text-orange-500">
                          {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString('en-IN')}`}
                        </p>
                      </div>
                      <p className="line-clamp-3 text-sm leading-7 text-slate-600">{item.description}</p>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>Category: <span className="font-medium text-slate-800">{item.category?.name || 'N/A'}</span></p>
                        <p>Condition: <span className="font-medium text-slate-800">{item.condition}</span></p>
                        <p>Seller: <span className="font-medium text-slate-800">{item.seller?.name || item.seller?.email?.split('@')[0]}</span></p>
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-wrap gap-3 border-t border-slate-200 px-5 py-5">
                      <Button variant="outline" className="flex-1" onClick={() => router.push(`/item/${item.id}`)}>
                        View Item
                      </Button>
                      {!item.isSold && (
                        <Button className="flex-1" onClick={() => router.push(`/chat/${item.id}`)}>
                          <MessageCircle className="h-4 w-4" />
                          Contact
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => handleRemove(item.id)}
                        disabled={removingId === item.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {removingId === item.id ? 'Removing...' : 'Remove'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
