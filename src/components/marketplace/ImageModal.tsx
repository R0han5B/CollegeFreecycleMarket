'use client';

import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import Image from 'next/image';

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
      <DialogContent className="max-w-4xl w-full p-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {imageUrl && (
          <div className="relative w-full aspect-video bg-black">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
