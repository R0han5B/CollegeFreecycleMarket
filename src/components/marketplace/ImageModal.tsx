'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getItemImages } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  imageUrls?: string[];
  initialIndex?: number;
  alt: string;
}

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  imageUrls,
  initialIndex = 0,
  alt,
}: ImageModalProps) {
  const images = getItemImages({
    image: imageUrl ?? null,
    images: imageUrls ?? [],
  });
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-fit max-w-[95vw] border-none bg-transparent p-0 shadow-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>
        {images[activeIndex] ? (
          <div className="inline-flex items-center justify-center overflow-hidden rounded-lg bg-black">
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1))}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <img
              src={images[activeIndex]}
              alt={alt}
              className="block h-auto max-h-[85vh] w-auto max-w-[95vw] object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1))}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-black px-8 py-10 text-center text-sm text-white/80">
            Image is no longer available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
