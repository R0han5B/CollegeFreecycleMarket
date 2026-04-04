'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ItemCard from '@/components/marketplace/ItemCard';
import SearchBar from '@/components/marketplace/SearchBar';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import { Button } from '@/components/ui/button';
import type { Item, Category } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isLoading && isAuthenticated) {
      fetchCategories();
      fetchItems();
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchItems = async (search = '', categoryId = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryId) params.append('category', categoryId);

      const response = await fetch(`/api/items?${params.toString()}`);
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

  const handleSearch = () => {
    fetchItems(searchQuery, selectedCategory);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    fetchItems(searchQuery, categoryId);
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
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-600">
              Browse items or post something you'd like to share with the community
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                />
              </div>
              <Button
                onClick={() => router.push('/post-item')}
                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600"
              >
                Post New Item
              </Button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category:</h3>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryChange}
              />
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600 text-lg mb-4">No items found</p>
              <Button
                onClick={() => router.push('/post-item')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Post an Item
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
