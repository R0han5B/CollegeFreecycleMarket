'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Category, Item } from '@/types';

type ItemFormValues = {
  title: string;
  description: string;
  price: string;
  condition: string;
  categoryId: string;
  tags: string[];
  images: string[];
};

interface ItemFormProps {
  categories: Category[];
  initialItem?: Item | null;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: ItemFormValues) => Promise<void>;
}

function dedupeTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length >= 2)
    )
  ).slice(0, 12);
}

export default function ItemForm({
  categories,
  initialItem,
  submitting,
  submitLabel,
  onSubmit,
}: ItemFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ItemFormValues>({
    title: initialItem?.title ?? '',
    description: initialItem?.description ?? '',
    price: initialItem ? String(initialItem.price) : '',
    condition: initialItem?.condition ?? '',
    categoryId: initialItem?.categoryId ?? '',
    tags: initialItem?.tags ?? [],
    images: initialItem?.images?.length ? initialItem.images : initialItem?.image ? [initialItem.image] : [],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    initialItem?.images?.length ? initialItem.images : initialItem?.image ? [initialItem.image] : []
  );
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const requestCounterRef = useRef(0);

  useEffect(() => {
    setFormData({
      title: initialItem?.title ?? '',
      description: initialItem?.description ?? '',
      price: initialItem ? String(initialItem.price) : '',
      condition: initialItem?.condition ?? '',
      categoryId: initialItem?.categoryId ?? '',
      tags: initialItem?.tags ?? [],
      images: initialItem?.images?.length ? initialItem.images : initialItem?.image ? [initialItem.image] : [],
    });
    setImagePreviews(initialItem?.images?.length ? initialItem.images : initialItem?.image ? [initialItem.image] : []);
  }, [initialItem]);

  useEffect(() => {
    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title && description.length < 12) {
      setSuggestedTags([]);
      return;
    }

    const controller = new AbortController();
    const currentRequestId = requestCounterRef.current + 1;
    requestCounterRef.current = currentRequestId;

    const timer = window.setTimeout(async () => {
      setSuggestingTags(true);

      try {
        const response = await fetch('/api/items/tag-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            categoryId: formData.categoryId,
            tags: formData.tags,
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load tag suggestions');
        }

        if (requestCounterRef.current === currentRequestId && Array.isArray(data.tags)) {
          setSuggestedTags(dedupeTags(data.tags));
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error('Failed to fetch tag suggestions:', error);
      } finally {
        if (requestCounterRef.current === currentRequestId) {
          setSuggestingTags(false);
        }
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [formData.title, formData.description, formData.categoryId, formData.tags]);

  const filteredSuggestedTags = useMemo(
    () => suggestedTags.filter((tag) => !formData.tags.includes(tag)),
    [suggestedTags, formData.tags]
  );

  const handleChange = (field: keyof ItemFormValues, value: string | string[]) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
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
      setFormData((current) => ({
        ...current,
        images: [...current.images, ...nextUploadedUrls],
      }));
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
    setFormData((current) => ({
      ...current,
      images: current.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();

    if (!normalizedTag) {
      return;
    }

    setFormData((current) => ({
      ...current,
      tags: dedupeTags([...current.tags, normalizedTag]),
    }));
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(tagInput);
    }
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

    await onSubmit({
      ...formData,
      tags: dedupeTags(formData.tags),
    });
  };

  return (
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
                <Input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload-more" />
                <Label htmlFor="image-upload-more" className="cursor-pointer">
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
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="description">Description *</Label>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              {suggestingTags ? 'Updating tag suggestions' : 'AI-assisted tags'}
            </div>
          </div>
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

        <div className="space-y-3 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Label htmlFor="tag-input">Search tags</Label>
              <p className="mt-1 text-sm text-slate-600">Tags stay hidden from buyers, but they help search find your item better.</p>
            </div>
            <Badge variant="outline">{formData.tags.length}/12 tags</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-2 px-3 py-1.5">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-slate-500 transition hover:text-slate-900">
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
            {formData.tags.length === 0 && <p className="text-sm text-slate-500">No tags added yet.</p>}
          </div>

          <div className="flex gap-3">
            <Input
              id="tag-input"
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
            />
            <Button type="button" variant="outline" onClick={() => addTag(tagInput)}>
              Add Tag
            </Button>
          </div>

          {filteredSuggestedTags.length > 0 && (
            <div className="space-y-2 rounded-[1.4rem] border border-orange-200 bg-orange-50/60 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Sparkles className="h-4 w-4 text-orange-500" />
                Recommended tags
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredSuggestedTags.map((tag) => (
                  <Button key={tag} type="button" variant="outline" size="sm" onClick={() => addTag(tag)}>
                    + {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" className="flex-1" size="lg" disabled={submitting || uploadingImages}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
