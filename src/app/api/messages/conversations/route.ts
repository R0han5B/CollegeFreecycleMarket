import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all unique conversations for this user
    // A conversation is defined by unique (userId, otherUserId, itemId) combinations
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        item: {
          select: {
            id: true,
            title: true,
            image: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group messages by conversation (unique combination of sender, receiver, and item)
    const conversationMap = new Map();

    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const conversationKey = `${otherUserId}-${message.itemId}`;

      if (!conversationMap.has(conversationKey)) {
        const otherUser = message.senderId === userId ? message.receiver : message.sender;

        conversationMap.set(conversationKey, {
          otherUserId,
          otherUser,
          item: message.item,
          lastMessage: message,
          unreadCount: message.receiverId === userId && !message.read ? 1 : 0,
        });
      } else {
        const conversation = conversationMap.get(conversationKey);
        // Update unread count
        if (message.receiverId === userId && !message.read) {
          conversation.unreadCount++;
        }
      }
    });

    const conversations = Array.from(conversationMap.values());

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
