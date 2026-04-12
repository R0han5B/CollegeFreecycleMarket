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
    <Link href={`/item/${item.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
          <ImageFallback
            src={currentImage}
            alt={item.title}
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-300">
                  {item.title.charAt(0)}
                </span>
              </div>
            }
          />
          {showImageControls && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setCurrentImageIndex((current) => (current === 0 ? images.length - 1 : current - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow transition hover:bg-white"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                {currentImageIndex + 1}/{images.length}
              </div>
            </>
          )}
          {item.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-orange-500">
              Featured
            </Badge>
          )}
          {item.isSold && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              Sold
            </Badge>
          )}
          {item.price === 0 && !item.isSold && (
            <Badge className="absolute bottom-2 left-2 bg-green-500">
              Free
            </Badge>
          )}
        </div>

        <CardContent className="p-4 flex-1">
          <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {item.description}
          </p>
          <div className="space-y-1 text-sm text-gray-500">
            <p>
              Category: <span className="font-medium text-gray-700">{item.category?.name || 'N/A'}</span>
            </p>
            <p>
              Condition: <span className="font-medium text-gray-700">{item.condition}</span>
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <UserIcon className="h-4 w-4" />
            <span className="truncate max-w-[100px]">
              {item.seller?.name || item.seller?.email?.split('@')[0]}
            </span>
          </div>
          <div className="font-bold text-lg text-orange-600">
            {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString('en-IN')}`}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
