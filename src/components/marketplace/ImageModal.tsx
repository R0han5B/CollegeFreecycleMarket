'use client';

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
        {imageUrl && (
          <div className="inline-flex items-center justify-center overflow-hidden rounded-lg bg-black">
            <img
              src={imageUrl}
              alt={alt}
              className="block h-auto max-h-[85vh] w-auto max-w-[95vw] object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
