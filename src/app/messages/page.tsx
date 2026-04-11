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
  }, [mounted, isLoading, isAuthenticated, user?.id]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">
              View and manage your conversations with buyers and sellers
            </p>
          </div>

          {/* Conversations List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 mb-6">
                  When you send or receive messages, they'll appear here
                </p>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Browse Items
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card
                  key={`${conversation.otherUserId}-${conversation.item.id}`}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    conversation.unreadCount > 0 ? 'border-orange-500 border-2' : ''
                  }`}
                  onClick={() => router.push(`/chat/${conversation.item.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Item Image */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <ImageFallback
                          src={conversation.item.image}
                          alt={conversation.item.title}
                          fill
                          className="object-cover"
                          fallback={
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-gray-400" />
                            </div>
                          }
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.item.title}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <UserIcon className="h-3 w-3" />
                              <span className="truncate">
                                {conversation.otherUser.name || conversation.otherUser.email.split('@')[0]}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-orange-500 text-xs">
                                  {conversation.unreadCount} new
                                </Badge>
                              )}
                            </p>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                addSuffix: true
                              })}
                            </p>
                            <p className="text-sm font-semibold text-orange-600">
                              {conversation.item.price === 0 ? 'FREE' : `₹${conversation.item.price.toLocaleString('en-IN')}`}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.imageUrl ? (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Image message
                            </span>
                          ) : (
                            conversation.lastMessage.content || 'Image message'
                          )}
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
