'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ImageModal from '@/components/marketplace/ImageModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getItemImages } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Phone, MessageCircle, ShoppingCart, ChevronLeft, ChevronRight, ArrowLeft, Pencil } from 'lucide-react';
import { ImageFallback } from '@/components/ui/ImageFallback';
import type { Item } from '@/types';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated, checkAuth, user, isLoading } = useAuthStore();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [savedToCart, setSavedToCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

    if (resolvedParams.id) {
      fetchItem(resolvedParams.id);
      checkCartStatus(resolvedParams.id);
    }
  }, [mounted, isLoading, isAuthenticated, resolvedParams.id, router]);

  const fetchItem = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items/${id}`);
      const data = await response.json();
      if (response.ok) {
        setItem(data.item);
        setSelectedImageIndex(0);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch item:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async () => {
    if (!item || !confirm('Mark this item as sold?')) return;

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSold: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setItem(data.item);
      }
    } catch (error) {
      console.error('Failed to mark item as sold:', error);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/items/${item.id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/my-items');
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const checkCartStatus = async (itemId: string) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/watchlist/${itemId}?userId=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setSavedToCart(data.saved);
      }
    } catch (error) {
      console.error('Failed to check cart status:', error);
    }
  };

  const handleCartToggle = async () => {
    if (!item || !user?.id) return;

    setCartLoading(true);
    try {
      const response = await fetch(savedToCart ? `/api/watchlist/${item.id}?userId=${user.id}` : '/api/watchlist', {
        method: savedToCart ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: savedToCart ? undefined : JSON.stringify({ userId: user.id, itemId: item.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setSavedToCart(data.saved);
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  if (!mounted || isLoading) {
    return <div className="page-shell flex items-center justify-center"><div className="page-loader" /></div>;
  }

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="page-shell flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center"><div className="page-loader" /></main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-shell flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center text-slate-400">Item not found</main>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === item.sellerId;
  const itemImages = getItemImages(item);
  const activeImage = itemImages[selectedImageIndex] ?? null;

  return (
    <div className="page-shell flex flex-col">
      <Header />
      <ImageModal
        key={`${item.id}-${selectedImageIndex}-${imageModalOpen ? 'open' : 'closed'}`}
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={item.image}
        imageUrls={item.images}
        initialIndex={selectedImageIndex}
        alt={item.title}
      />

      <main className="flex-1 page-section">
        <div className="page-container space-y-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Card className="overflow-hidden rounded-[2rem] py-0">
                <div
                  className="relative aspect-square cursor-pointer overflow-hidden bg-linear-to-br from-orange-50 via-white to-slate-50"
                  onClick={() => activeImage && setImageModalOpen(true)}
                >
                  <ImageFallback
                    src={activeImage}
                    alt={item.title}
                    fill
                    className="object-contain p-6"
                    priority
                    fallback={
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-6xl font-bold text-slate-600">{item.title.charAt(0)}</span>
                      </div>
                    }
                  />
                  {itemImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedImageIndex((current) => (current === 0 ? itemImages.length - 1 : current - 1));
                        }}
                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedImageIndex((current) => (current === itemImages.length - 1 ? 0 : current + 1));
                        }}
                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm text-slate-700 shadow-sm">
                        {selectedImageIndex + 1}/{itemImages.length}
                      </div>
                    </>
                  )}
                  <div className="absolute left-4 top-4 flex gap-2">
                    {item.isSold && <Badge variant="destructive">Sold</Badge>}
                    {item.price === 0 && !item.isSold && <Badge variant="secondary">Free</Badge>}
                  </div>
                </div>
                {itemImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 border-t border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-5">
                    {itemImages.map((imageUrl, index) => (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                          selectedImageIndex === index ? 'border-orange-400' : 'border-transparent'
                        }`}
                      >
                        <ImageFallback
                          src={imageUrl}
                          alt={`${item.title} thumbnail ${index + 1}`}
                          fill
                          className="object-contain bg-white p-2"
                          fallback={<div className="h-full w-full bg-white" />}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="premium-card rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-3xl text-slate-900">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-4xl font-black text-orange-500">
                      {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString('en-IN')}`}
                    </span>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>Category: <span className="font-medium text-slate-800">{item.category?.name || 'N/A'}</span></p>
                      <p>Condition: <span className="font-medium text-slate-800">{item.condition}</span></p>
                    </div>
                  </div>
                  <p className="leading-8 text-slate-600">{item.description}</p>
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="h-4 w-4" />
                      <span className="truncate">{item.seller?.name || item.seller?.email?.split('@')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">Seller information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-orange-50 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.seller?.name || 'N/A'}</p>
                      <p className="text-sm text-slate-600">{item.seller?.email}</p>
                    </div>
                  </div>
                  {item.seller?.phone && (
                    <div className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-orange-50 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <Phone className="h-5 w-5" />
                      </div>
                      <p className="text-slate-700">{item.seller.phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-3">
                {!isOwner && !item.isSold && (
                  <>
                    <Button className="flex-1" size="lg" onClick={() => router.push(`/chat/${item.id}`)}>
                      <MessageCircle className="h-5 w-5" />
                      Contact Seller
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleCartToggle} disabled={cartLoading}>
                      <ShoppingCart className="h-5 w-5" />
                      {cartLoading ? 'Updating...' : savedToCart ? 'Remove from Cart' : 'Save to Cart'}
                    </Button>
                  </>
                )}

                {isOwner && (
                  <>
                    <Button className="flex-1" onClick={() => router.push(`/my-items/${item.id}/edit`)}>
                      <Pencil className="h-5 w-5" />
                      Edit Item
                    </Button>
                    {!item.isSold && (
                      <Button className="flex-1" variant="outline" onClick={handleMarkSold}>
                        Mark as Sold
                      </Button>
                    )}
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
