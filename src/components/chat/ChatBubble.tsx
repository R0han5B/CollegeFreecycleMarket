'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ImageOff } from 'lucide-react';
import { ImageFallback } from '@/components/ui/ImageFallback';
import ImageModal from '@/components/marketplace/ImageModal';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export function ChatBubble({ message, isOwn, showAvatar = true }: ChatBubbleProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [canOpenImage, setCanOpenImage] = useState(Boolean(message.imageUrl));
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
          {!isOwn && message.sender?.name && <span className="mb-1 text-xs text-slate-500">{message.sender.name}</span>}
          <div
            className={`rounded-[1.35rem] border px-4 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.22)] ${
              isOwn
                ? 'rounded-br-md border-orange-300 bg-orange-500 text-white'
                : 'rounded-bl-md border-slate-200 bg-white text-slate-800'
            }`}
          >
            {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
            {message.imageUrl && (
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
                    <ImageFallback
                      src={message.imageUrl}
                      alt="Shared image"
                      width={300}
                      height={200}
                      className="h-auto w-full object-cover"
                      unoptimized
                      fallback={
                        <div className="flex h-[200px] w-[300px] max-w-full items-center justify-center bg-muted text-muted-foreground">
                          <span className="flex items-center gap-2 text-sm">
                            <ImageOff className="h-4 w-4" />
                            Image unavailable
                          </span>
                        </div>
                      }
                      onError={() => setCanOpenImage(false)}
                    />
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
      <ImageModal isOpen={isImageOpen} onClose={() => setIsImageOpen(false)} imageUrl={canOpenImage ? message.imageUrl : null} alt="Shared image" />
    </>
  );
}
