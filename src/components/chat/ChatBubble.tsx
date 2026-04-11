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
    ? message.sender.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <>
      <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
        {showAvatar && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {!isOwn && message.sender?.name && (
            <span className="text-xs text-muted-foreground mb-1">
              {message.sender.name}
            </span>
          )}
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted rounded-bl-md'
            }`}
          >
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
            {message.imageUrl && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => canOpenImage && setIsImageOpen(true)}
                  className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Open shared image"
                  title="Open image"
                  disabled={!canOpenImage}
                >
                  <div className="relative w-full max-w-[300px] rounded-lg overflow-hidden border border-border/40 transition-opacity hover:opacity-90">
                    <ImageFallback
                      src={message.imageUrl}
                      alt="Shared image"
                      width={300}
                      height={200}
                      className="object-cover w-full"
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
          <span className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      <ImageModal
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        imageUrl={canOpenImage ? message.imageUrl : null}
        alt="Shared image"
      />
    </>
  );
}
