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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Cart</h1>
              <p className="text-gray-600 mt-2">
                Items you saved for later are collected here.
              </p>
            </div>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              {watchlist.length} item{watchlist.length === 1 ? '' : 's'}
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Tap Save on any item and it will appear here.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Browse Items
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {watchlist.map((entry) => {
                const item = entry.item;

                if (!item) return null;

                return (
                  <Card key={entry.id} className="overflow-hidden h-full flex flex-col">
                    <div
                      className="relative aspect-video bg-gray-100 cursor-pointer"
                      onClick={() => router.push(`/item/${item.id}`)}
                    >
                      <ImageFallback
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        fallback={
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-5xl font-bold text-gray-300">
                              {item.title.charAt(0)}
                            </span>
                          </div>
                        }
                      />
                      {item.isSold && (
                        <Badge className="absolute top-3 left-3 bg-red-500">Sold</Badge>
                      )}
                    </div>

                    <CardContent className="p-5 flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                            {item.title}
                          </h2>
                          <p className="text-orange-600 font-bold mt-2">
                            {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString('en-IN')}`}
                          </p>
                        </div>
                        <Badge variant="outline">{item.category?.name}</Badge>
                      </div>

                      <p className="text-gray-600 line-clamp-3">{item.description}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{item.seller?.name || item.seller?.email?.split('@')[0]}</span>
                        <span>•</span>
                        <span>{item.condition}</span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-5 pt-0 flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/item/${item.id}`)}
                      >
                        View Item
                      </Button>
                      {!item.isSold && (
                        <Button
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                          onClick={() => router.push(`/chat/${item.id}`)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => handleRemove(item.id)}
                        disabled={removingId === item.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
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
