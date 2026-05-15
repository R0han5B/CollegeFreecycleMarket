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
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import type { Item, Category } from '@/types';
import { ArrowRight, MessageSquare, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [itemsLoading, setItemsLoading] = useState(true);
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

  const fetchItems = async (
    search = '',
    categoryId: string | null = null,
    nextPriceRange: [number, number] = DEFAULT_PRICE_RANGE
  ) => {
    setItemsLoading(true);
    try {
      const params = new URLSearchParams();
      const trimmedSearch = search.trim();
      const normalizedCategoryId = typeof categoryId === 'string' && categoryId.length > 0 ? categoryId : null;
      const [minPrice, maxPrice] = nextPriceRange;

      if (trimmedSearch) params.set('search', trimmedSearch);
      if (normalizedCategoryId) params.set('category', normalizedCategoryId);
      if (minPrice > DEFAULT_PRICE_RANGE[0]) params.set('minPrice', String(minPrice));
      if (maxPrice < DEFAULT_PRICE_RANGE[1]) params.set('maxPrice', String(maxPrice));

      const query = params.toString();
      const endpoint = query ? `/api/items?${query}` : '/api/items';

      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Items request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (error) {
      setItems([]);
      console.error('Failed to fetch items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchItems(searchQuery, selectedCategory, priceRange);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    fetchItems(searchQuery, categoryId, priceRange);
  };

  const handlePriceChange = (nextRange: number[]) => {
    if (nextRange.length !== 2) return;
    setPriceRange([nextRange[0], nextRange[1]]);
  };

  const handlePriceCommit = (nextRange: number[]) => {
    if (nextRange.length !== 2) return;
    const normalizedRange: [number, number] = [nextRange[0], nextRange[1]];
    setPriceRange(normalizedRange);
    fetchItems(searchQuery, selectedCategory, normalizedRange);
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

      <main className="flex-1">
        <section className="page-section">
          <div className="page-container space-y-8">
            <div className="glass-panel top-grid-glow relative overflow-hidden rounded-[2rem] px-6 py-8 md:px-8">
              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
                <div className="space-y-5">
                  <Badge className="w-fit">Live marketplace</Badge>
                  <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                      Welcome back, <span className="gradient-text">{user?.name || user?.email?.split('@')[0]}</span>
                    </h1>
                    <p className="max-w-2xl text-base leading-8 text-slate-600">
                      Browse current listings, filter by category, and post something useful for the community in a cleaner, faster workspace.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" onClick={() => router.push('/post-item')}>
                      Post New Item
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => router.push('/messages')}>
                      Open Messages
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { icon: ShieldCheck, title: 'Verified', copy: 'Campus-only listings' },
                      { icon: MessageSquare, title: 'Responsive', copy: 'Real-time messaging' },
                      { icon: Zap, title: 'Fast', copy: 'Post and connect quickly' },
                    ].map((card) => (
                      <div key={card.title} className="premium-card rounded-[1.5rem] p-5">
                        <card.icon className="h-5 w-5 text-orange-500" />
                        <p className="mt-4 font-semibold text-slate-900">{card.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{card.copy}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="premium-card rounded-[2rem] p-5 md:p-6">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="section-badge mb-3">Discover</div>
                  <h2 className="text-2xl font-bold text-slate-900">Search and filter listings</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-slate-700">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  {items.length} active item{items.length === 1 ? '' : 's'} found
                </div>
              </div>

              <div className="space-y-5">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} />
                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                    Filter by category
                  </h3>
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategoryChange}
                  />
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                        Filter by price
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        ₹{priceRange[0].toLocaleString('en-IN')} to ₹{priceRange[1].toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPriceRange(DEFAULT_PRICE_RANGE);
                        fetchItems(searchQuery, selectedCategory, DEFAULT_PRICE_RANGE);
                      }}
                      disabled={
                        priceRange[0] === DEFAULT_PRICE_RANGE[0] && priceRange[1] === DEFAULT_PRICE_RANGE[1]
                      }
                    >
                      Reset price
                    </Button>
                  </div>

                  <Slider
                    min={DEFAULT_PRICE_RANGE[0]}
                    max={DEFAULT_PRICE_RANGE[1]}
                    step={100}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    onValueCommit={handlePriceCommit}
                    className="py-2"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    <span>₹0</span>
                    <span>₹10,000</span>
                  </div>
                </div>
              </div>
            </div>

            {itemsLoading ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white/80">
                <div className="page-loader" />
              </div>
            ) : items.length === 0 ? (
              <div className="premium-card rounded-[2rem] px-6 py-14 text-center">
                <h3 className="text-2xl font-semibold text-slate-900">No items found</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
                  Try a different keyword or category, or create a new listing to kick-start activity.
                </p>
                <Button className="mt-6" onClick={() => router.push('/post-item')}>
                  Post an Item
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
