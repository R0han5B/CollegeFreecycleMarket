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
  }, [mounted, isLoading, isAuthenticated, user?.id]);

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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Items</h1>
              <p className="text-gray-600">
                Manage items you've posted on the marketplace
              </p>
            </div>
            <Button
              onClick={() => router.push('/post-item')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <PlusSquare className="h-5 w-5 mr-2" />
              Post New Item
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-3xl font-bold text-gray-900">{items.length}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-3xl font-bold text-green-600">
                {items.filter((i) => !i.isSold).length}
              </p>
              <p className="text-sm text-gray-600">Available</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-3xl font-bold text-orange-600">
                {items.filter((i) => i.price === 0).length}
              </p>
              <p className="text-sm text-gray-600">Free Items</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-3xl font-bold text-red-600">
                {items.filter((i) => i.isSold).length}
              </p>
              <p className="text-sm text-gray-600">Sold</p>
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading your items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600 text-lg mb-4">
                You haven't posted any items yet
              </p>
              <Button
                onClick={() => router.push('/post-item')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <PlusSquare className="h-5 w-5 mr-2" />
                Post Your First Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
