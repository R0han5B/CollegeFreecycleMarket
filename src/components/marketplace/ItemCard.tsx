'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { getItemImages } from '@/lib/utils';
import type { Item } from '@/types';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const images = getItemImages(item);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentImage = images[currentImageIndex] ?? null;
  const showImageControls = images.length > 1;

  return (
    <Link href={`/item/${item.id}`} className="group h-full">
      <Card className="premium-card h-full gap-0 overflow-hidden py-0">
        <div className="relative aspect-square overflow-hidden bg-linear-to-br from-orange-50 via-white to-slate-50">
          <ImageFallback
            src={currentImage}
            alt={item.title}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-4xl font-bold text-slate-600">{item.title.charAt(0)}</span>
              </div>
            }
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/28 via-transparent to-transparent" />
          {showImageControls && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setCurrentImageIndex((current) => (current === 0 ? images.length - 1 : current - 1));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setCurrentImageIndex((current) => (current === images.length - 1 ? 0 : current + 1));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs text-slate-700 shadow-sm">
                {currentImageIndex + 1}/{images.length}
              </div>
            </>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {item.isSold && <Badge variant="destructive">Sold</Badge>}
            {item.isFeatured && <Badge>Featured</Badge>}
          </div>
          {item.price === 0 && !item.isSold && (
            <Badge variant="secondary" className="absolute bottom-3 left-3">
              Free
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          <div className="mb-4">
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
          <div className="mt-auto grid gap-2 text-sm text-slate-600">
            <p>
              Category: <span className="font-medium text-slate-800">{item.category?.name || 'N/A'}</span>
            </p>
            <p>
              Condition: <span className="font-medium text-slate-800">{item.condition}</span>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <UserIcon className="h-4 w-4" />
            </div>
            <span className="max-w-[100px] truncate">
              {item.seller?.name || item.seller?.email?.split('@')[0]}
            </span>
          </div>
          <div className="text-lg font-bold text-orange-600">
            {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString('en-IN')}`}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
