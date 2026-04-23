'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/types';

export default function PostItemPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: '',
    categoryId: '',
  });

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

    fetchCategories();
  }, [mounted, isLoading, isAuthenticated, router]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);

    try {
      const previewPromises = files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read image preview'));
            reader.readAsDataURL(file);
          })
      );

      const nextPreviews = await Promise.all(previewPromises);
      const nextUploadedUrls: string[] = [];

      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        nextUploadedUrls.push(data.imageUrl);
      }

      setImagePreviews((current) => [...current, ...nextPreviews]);
      setUploadedImageUrls((current) => [...current, ...nextUploadedUrls]);
      toast({
        title: 'Images uploaded successfully',
        description: `${nextUploadedUrls.length} image${nextUploadedUrls.length === 1 ? '' : 's'} ready for your listing`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
      });
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreviews((current) => current.filter((_, index) => index !== indexToRemove));
    setUploadedImageUrls((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.condition || !formData.categoryId) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'You need to sign in again',
        description: 'Your session was not available while posting the item.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price) || 0,
          sellerId: user.id,
          image: uploadedImageUrls[0] ?? null,
          images: uploadedImageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create item');
      }

      toast({
        title: 'Item posted successfully!',
        description: 'Your item is now visible to others',
      });
      router.push('/my-items');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to post item',
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
              <div className="section-badge mb-3">Create listing</div>
              <h1 className="section-title">Post an item</h1>
              <p className="section-copy">
                Add a clear title, strong description, and photos so the right buyer can respond quickly.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <Card className="premium-card rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">Item details</CardTitle>
              <CardDescription className="text-slate-600">
                Everything here stays on the frontend experience. Posting logic and APIs are unchanged.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Images (Optional)</Label>
                  <div className="rounded-[1.6rem] border border-dashed border-orange-200 bg-orange-50/60 p-6 text-center">
                    {imagePreviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {imagePreviews.map((imagePreview, index) => (
                            <div key={`${imagePreview}-${index}`} className="relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white p-3">
                              <div className="relative h-40 overflow-hidden rounded-xl bg-slate-50">
                                <img src={imagePreview} alt={`Preview ${index + 1}`} className="h-full w-full object-contain" />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute right-5 top-5"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center">
                          <Input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild disabled={uploadingImages}>
                              <span>
                                <Upload className="h-4 w-4" />
                                {uploadingImages ? 'Uploading...' : 'Add More Images'}
                              </span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="mx-auto mb-3 h-12 w-12 text-orange-500" />
                        <p className="mb-4 text-sm text-slate-600">Upload one or more images to make your listing stand out.</p>
                        <Input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" asChild disabled={uploadingImages}>
                            <span>
                              <Upload className="h-4 w-4" />
                              {uploadingImages ? 'Uploading...' : 'Choose Images'}
                            </span>
                          </Button>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Engineering Mathematics Textbook"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the item, its condition, and any other relevant details..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹ INR, 0 for Free)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                    />
                    <p className="text-sm text-slate-600">Leave at 0 if you want to give it away for free.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleChange('condition', value)} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => handleChange('categoryId', value)}
                      required
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="submit" className="flex-1" size="lg" disabled={submitting || uploadingImages}>
                    {submitting ? 'Posting...' : 'Post Item'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
