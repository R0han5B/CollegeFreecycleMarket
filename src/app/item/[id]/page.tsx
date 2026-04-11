'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ImageModal from '@/components/marketplace/ImageModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Package,
  Tag,
  MessageCircle,
  ShoppingCart,
} from 'lucide-react';
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
  }, [mounted, isLoading, isAuthenticated, resolvedParams.id]);

  const fetchItem = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items/${id}`);
      const data = await response.json();
      if (response.ok) {
        setItem(data.item);
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
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      });

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
      const response = await fetch(
        savedToCart
          ? `/api/watchlist/${item.id}?userId=${user.id}`
          : '/api/watchlist',
        {
          method: savedToCart ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: savedToCart
            ? undefined
            : JSON.stringify({
                userId: user.id,
                itemId: item.id,
              }),
        }
      );

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Item not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === item.sellerId;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={item.image}
        alt={item.title}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-gray-100 cursor-pointer" onClick={() => item.image && setImageModalOpen(true)}>
                <ImageFallback
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                  fallback={
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-6xl font-bold text-gray-300">
                        {item.title.charAt(0)}
                      </span>
                    </div>
                  }
                />
                {item.isSold && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-lg px-4 py-2">
                    SOLD
                  </Badge>
                )}
                {item.price === 0 && !item.isSold && (
                  <Badge className="absolute top-4 right-4 bg-green-500 text-lg px-4 py-2">
                    FREE
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <Badge variant="outline">{item.category?.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-orange-600">
                    {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString('en-IN')}`}
                  </span>
                  <Badge variant="secondary">{item.condition}</Badge>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {item.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="truncate">
                      {item.seller?.name || item.seller?.email?.split('@')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{item.seller?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{item.seller?.email}</p>
                  </div>
                </div>
                {item.seller?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Phone className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-gray-700">{item.seller.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isOwner && !item.isSold && (
                <>
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    size="lg"
                    onClick={() => router.push(`/chat/${item.id}`)}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Contact Seller
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCartToggle}
                    disabled={cartLoading}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {cartLoading
                      ? 'Updating...'
                      : savedToCart
                        ? 'Remove from Cart'
                        : 'Save to Cart'}
                  </Button>
                </>
              )}

              {isOwner && (
                <>
                  {!item.isSold && (
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={handleMarkSold}
                    >
                      Mark as Sold
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
