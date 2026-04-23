'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, ShoppingBag, User as UserIcon, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { getPrimaryItemImage } from '@/lib/utils';

interface Conversation {
  otherUserId: string;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
  };
  item: {
    id: string;
    title: string;
    image: string | null;
    images?: string[];
    price: number;
  };
  lastMessage: {
    id: string;
    content: string | null;
    createdAt: Date;
    imageUrl: string | null;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      fetchConversations();
    }
  }, [mounted, isLoading, isAuthenticated, user?.id, router]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations?userId=${user?.id}`);
      const data = await response.json();
      if (response.ok) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="page-loader" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="page-shell flex flex-col">
      <Header />

      <main className="flex-1 page-section">
        <div className="page-container max-w-5xl space-y-8">
          <div>
            <div className="section-badge mb-3">Inbox</div>
            <h1 className="section-title">Messages</h1>
            <p className="section-copy">All your buyer and seller conversations stay organized here.</p>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.04]">
              <div className="page-loader" />
            </div>
          ) : conversations.length === 0 ? (
            <Card className="premium-card rounded-[2rem]">
              <CardContent className="py-16 text-center">
                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-slate-600" />
                <h3 className="text-lg font-medium text-white">No messages yet</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
                  Once you contact a seller or receive a message, the conversation will appear here.
                </p>
                <Button onClick={() => router.push('/dashboard')} className="mt-6">
                  Browse Items
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <Card
                  key={`${conversation.otherUserId}-${conversation.item.id}`}
                  className={`premium-card cursor-pointer rounded-[1.6rem] ${conversation.unreadCount > 0 ? 'border-orange-400/30' : 'border-white/10'}`}
                  onClick={() => router.push(`/chat/${conversation.item.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-[1.1rem] bg-[#151b30]">
                        <ImageFallback
                          src={getPrimaryItemImage(conversation.item)}
                          alt={conversation.item.title}
                          fill
                          className="object-contain p-2"
                          fallback={
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-slate-500" />
                            </div>
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-white">{conversation.item.title}</h3>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                              <UserIcon className="h-3 w-3" />
                              <span className="truncate">
                                {conversation.otherUser.name || conversation.otherUser.email.split('@')[0]}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="secondary" className="normal-case tracking-normal">
                                  {conversation.unreadCount} new
                                </Badge>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-orange-300">
                              {conversation.item.price === 0 ? 'FREE' : `₹${conversation.item.price.toLocaleString('en-IN')}`}
                            </p>
                          </div>
                        </div>
                        <p className="truncate text-sm text-slate-400">
                          {conversation.lastMessage.imageUrl ? 'Image message' : conversation.lastMessage.content || 'Image message'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
