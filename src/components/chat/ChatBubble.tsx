'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import Image from 'next/image';
import ImageModal from '@/components/marketplace/ImageModal';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export function ChatBubble({ message, isOwn, showAvatar = true }: ChatBubbleProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
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
                  onClick={() => setIsImageOpen(true)}
                  className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Open shared image"
                  title="Open image"
                >
                  <div className="relative w-full max-w-[300px] rounded-lg overflow-hidden border border-border/40 transition-opacity hover:opacity-90">
                    <Image
                      src={message.imageUrl}
                      alt="Shared image"
                      width={300}
                      height={200}
                      className="object-cover w-full"
                      unoptimized
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
        imageUrl={message.imageUrl}
        alt="Shared image"
      />
    </>
  );
}
