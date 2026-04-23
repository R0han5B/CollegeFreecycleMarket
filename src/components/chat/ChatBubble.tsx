'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ImageOff, Trash2 } from 'lucide-react';
import ImageModal from '@/components/marketplace/ImageModal';
import { sanitizeImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onDelete?: (message: Message) => void;
  isDeleting?: boolean;
}

export function ChatBubble({ message, isOwn, showAvatar = true, onDelete, isDeleting = false }: ChatBubbleProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const safeImageUrl = sanitizeImageUrl(message.imageUrl);
  const [canOpenImage, setCanOpenImage] = useState(Boolean(safeImageUrl));
  const initials = message.sender?.name
    ? message.sender.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <>
      <div className={`mb-4 flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
        {showAvatar && (
          <Avatar className="h-9 w-9 flex-shrink-0 border border-slate-200">
            <AvatarFallback className="bg-orange-100 text-xs text-orange-700">{initials}</AvatarFallback>
          </Avatar>
        )}
        <div className={`flex max-w-[78%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {isOwn && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mb-1 h-auto px-2 py-1 text-xs text-slate-500 hover:text-red-600"
              onClick={() => onDelete(message)}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          {!isOwn && message.sender?.name && <span className="mb-1 text-xs text-slate-500">{message.sender.name}</span>}
          <div
            className={`rounded-[1.35rem] border px-4 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.22)] ${
              isOwn
                ? 'rounded-br-md border-orange-300 bg-orange-500 text-white'
                : 'rounded-bl-md border-slate-200 bg-white text-slate-800'
            }`}
          >
            {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
            {safeImageUrl && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => canOpenImage && setIsImageOpen(true)}
                  className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Open shared image"
                  title="Open image"
                  disabled={!canOpenImage}
                >
                  <div className="relative w-full max-w-[300px] overflow-hidden rounded-xl border border-slate-200 transition-opacity hover:opacity-90">
                    {canOpenImage ? (
                      <img
                        src={safeImageUrl}
                        alt="Shared image"
                        className="h-auto w-full object-cover"
                        loading="lazy"
                        onError={() => setCanOpenImage(false)}
                      />
                    ) : (
                      <div className="flex h-[200px] w-[300px] max-w-full items-center justify-center bg-muted text-muted-foreground">
                        <span className="flex items-center gap-2 text-sm">
                          <ImageOff className="h-4 w-4" />
                          Image unavailable
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
          <span className="mt-1 text-xs text-slate-500">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      <ImageModal isOpen={isImageOpen} onClose={() => setIsImageOpen(false)} imageUrl={canOpenImage ? safeImageUrl : null} alt="Shared image" />
    </>
  );
}
