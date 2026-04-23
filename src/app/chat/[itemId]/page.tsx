'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Package, User } from 'lucide-react';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { getPrimaryItemImage } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import type { Message, Item } from '@/types';

function mergeMessagesById(current: Message[], incoming: Message[]) {
  const seen = new Set<string>();

  return [...current, ...incoming].filter((message) => {
    const key = `${message.id}-${message.createdAt}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export default function ChatPage({ params }: { params: Promise<{ itemId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [item, setItem] = useState<Item | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ id: string; name: string | null; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (resolvedParams.itemId) {
      fetchItem(resolvedParams.itemId);
    }
  }, [mounted, isLoading, isAuthenticated, resolvedParams.itemId, router]);

  useEffect(() => {
    if (!item || !user) return;

    if (item.sellerId === user.id) {
      fetch(`/api/messages/${item.id}?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            const messageFromBuyer = data.messages.find((m: Message) => m.senderId !== user.id);
            if (messageFromBuyer) {
              const buyerId = messageFromBuyer.senderId;
              setOtherUser({
                id: buyerId,
                name: messageFromBuyer.sender?.name || null,
                email: messageFromBuyer.sender?.email || '',
              });

              const conversationMessages = data.messages.filter(
                (m: Message) =>
                  (m.senderId === user.id && m.receiverId === buyerId) ||
                  (m.senderId === buyerId && m.receiverId === user.id)
              );
              setMessages(conversationMessages);

              const socketInstance = io(undefined, {
                transports: ['websocket', 'polling'],
              });

              socketInstance.on('connect', () => {
                socketInstance.emit('user:join', user.id);
              });

              socketInstance.on('message:receive', (newMessage: Message) => {
                if (
                  (newMessage.senderId === user.id && newMessage.receiverId === buyerId) ||
                  (newMessage.senderId === buyerId && newMessage.receiverId === user.id)
                ) {
                  setMessages((prev) => mergeMessagesById(prev, [newMessage]));
                  scrollToBottom();
                }
              });

              setSocket(socketInstance);
            }
          }
        });
    } else {
      const sellerId = item.sellerId;
      setOtherUser({
        id: sellerId,
        name: item.seller?.name || null,
        email: item.seller?.email || '',
      });

      fetchMessages(item.id, user.id, sellerId);

      const socketInstance = io(undefined, {
        transports: ['websocket', 'polling'],
      });

      socketInstance.on('connect', () => {
        socketInstance.emit('user:join', user.id);
      });

      socketInstance.on('message:receive', (newMessage: Message) => {
        setMessages((prev) => mergeMessagesById(prev, [newMessage]));
        scrollToBottom();
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [item, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchItem = async (itemId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items/${itemId}`);
      const data = await response.json();
      if (response.ok) {
        setItem(data.item);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch item:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (itemId: string, userId: string, otherUserId: string) => {
    try {
      const response = await fetch(`/api/messages/${itemId}?userId=${userId}&otherUserId=${otherUserId}`);
      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => mergeMessagesById(prev, data.messages));
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!user || !item || !otherUser) return;

    const messageData = {
      senderId: user.id,
      receiverId: otherUser.id,
      itemId: item.id,
      content,
      imageUrl,
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const data = await response.json();

        socket?.emit('message:send', {
          messageId: data.message.id,
          senderId: data.message.senderId,
          receiverId: data.message.receiverId,
          itemId: data.message.itemId,
          content: data.message.content,
          imageUrl: data.message.imageUrl,
          createdAt: data.message.createdAt,
        });

        setMessages((prev) => mergeMessagesById(prev, [data.message]));
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!mounted || isLoading) {
    return <div className="page-shell flex items-center justify-center"><div className="page-loader" /></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="page-shell flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center"><div className="page-loader" /></main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-shell flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center text-slate-400">Item not found</main>
        <Footer />
      </div>
    );
  }

  const isSeller = user.id === item.sellerId;
  const primaryImage = getPrimaryItemImage(item);

  return (
    <div className="page-shell flex flex-col">
      <Header />

      <main className="flex-1 page-section">
        <div className="page-container max-w-5xl">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.6rem] border border-slate-200 bg-white p-3 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-orange-50">
                <ImageFallback
                  src={primaryImage}
                  alt={item.title}
                  fill
                  className="object-contain p-2"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-5 w-5 text-slate-500" />
                    </div>
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-semibold text-slate-900">{item.title}</h1>
                <p className="text-sm text-slate-600">
                  Chatting with {otherUser?.name || otherUser?.email?.split('@')[0] || (isSeller ? 'buyer' : 'seller')}
                </p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] py-0">
            <div className="h-[calc(100vh-320px)] min-h-[520px] overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                  <User className="mb-4 h-12 w-12 text-orange-400" />
                  <p className="text-lg font-medium text-slate-900">No messages yet</p>
                  <p className="text-sm">Start the conversation by sending a message.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatBubble
                    key={`${message.id}-${message.createdAt}-${index}`}
                    message={message}
                    isOwn={message.senderId === user.id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSendMessage} disabled={!otherUser} />
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
