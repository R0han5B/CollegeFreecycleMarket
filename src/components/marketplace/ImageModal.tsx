'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  alt: string;
}

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  alt,
}: ImageModalProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

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
        {imageUrl && failedImageUrl !== imageUrl ? (
          <div className="inline-flex items-center justify-center overflow-hidden rounded-lg bg-black">
            <img
              src={imageUrl}
              alt={alt}
              className="block h-auto max-h-[85vh] w-auto max-w-[95vw] object-contain"
              onError={() => setFailedImageUrl(imageUrl)}
            />
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
