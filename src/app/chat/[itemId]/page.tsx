'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, User } from 'lucide-react';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';
import type { Message, Item } from '@/types';

export default function ChatPage({ params }: { params: { itemId: string } }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth, user, isLoading } = useAuthStore();
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
    if (!mounted) return;

    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (params.itemId) {
      fetchItem(params.itemId);
    }
  }, [mounted, isLoading, isAuthenticated, params.itemId]);

  useEffect(() => {
    if (!item || !user) return;

    // Determine the other user
    const otherUserId = item.sellerId === user.id ? null : item.sellerId;
    if (!otherUserId) {
      return;
    }

    setOtherUser({
      id: otherUserId,
      name: item.seller?.name || null,
      email: item.seller?.email || ''
    });

    // Fetch messages
    fetchMessages(item.id, user.id, otherUserId);

    // Initialize Socket.io connection
    const socketInstance = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to chat server');
      socketInstance.emit('user:join', user.id);
    });

    socketInstance.on('message:receive', (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
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
        setMessages(data.messages);
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
      imageUrl
    };

    try {
      // Send via API to save to database
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const data = await response.json();

        // Send via Socket.io for real-time delivery
        socket?.emit('message:send', {
          messageId: data.message.id,
          senderId: data.message.senderId,
          receiverId: data.message.receiverId,
          itemId: data.message.itemId,
          content: data.message.content,
          imageUrl: data.message.imageUrl,
          createdAt: data.message.createdAt
        });

        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Item not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if current user is the seller
  const isSeller = user.id === item.sellerId;
  const chatPartner = isSeller ? null : item.seller;

  // If user is the seller, we need to find who they're chatting with
  // For now, we'll show the item info and allow the seller to see incoming messages

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              {item.image && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-lg truncate">{item.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Chatting with {isSeller ? 'buyer' : (chatPartner?.name || chatPartner?.email?.split('@')[0] || 'seller')}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <Card className="flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <User className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Start the conversation by sending a message</p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === user.id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <ChatInput
              onSend={handleSendMessage}
              disabled={!otherUser && !isSeller}
            />
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
