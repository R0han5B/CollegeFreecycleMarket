'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ItemForm from '@/components/marketplace/ItemForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Category, Item } from '@/types';

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    void fetchPageData();
  }, [mounted, isLoading, isAuthenticated, resolvedParams.id, router]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const [categoriesResponse, itemResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/items/${resolvedParams.id}`),
      ]);

      const [categoriesData, itemData] = await Promise.all([
        categoriesResponse.json(),
        itemResponse.json(),
      ]);

      if (categoriesResponse.ok) {
        setCategories(categoriesData.categories);
      }

      if (!itemResponse.ok) {
        throw new Error(itemData.error || 'Failed to load item');
      }

      if (itemData.item.sellerId !== user?.id) {
        router.push('/my-items');
        return;
      }

      setItem(itemData.item);
    } catch (error) {
      console.error('Failed to load edit page:', error);
      toast({
        variant: 'destructive',
        title: 'Could not load item',
        description: 'Please try again.',
      });
      router.push('/my-items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    title: string;
    description: string;
    price: string;
    condition: string;
    categoryId: string;
    tags: string[];
    images: string[];
  }) => {
    setSubmitting(true);

    try {
      const response = await fetch(`/api/items/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          price: parseInt(values.price, 10) || 0,
          image: values.images[0] ?? null,
          images: values.images,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update item');
      }

      toast({
        title: 'Item updated',
        description: 'Your details, images, and hidden search tags are now saved.',
      });
      router.push(`/item/${resolvedParams.id}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update item',
        description: error.message || 'Please try again',
      });
    } finally {
      setSubmitting(false);
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
        <div className="page-container max-w-5xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="section-badge mb-3">Manage listing</div>
              <h1 className="section-title">Edit item</h1>
              <p className="section-copy">
                Update your details, photos, price, and hidden search tags from one place.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <Card className="premium-card rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">Edit listing</CardTitle>
              <CardDescription className="text-slate-600">
                AI suggestions are available here too, but you stay in control of the final tags.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !item ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="page-loader" />
                </div>
              ) : (
                <ItemForm
                  categories={categories}
                  initialItem={item}
                  submitting={submitting}
                  submitLabel="Save Changes"
                  onSubmit={handleSubmit}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
