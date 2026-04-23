import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const otherUserId = searchParams.get('otherUserId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let messages;

    // If otherUserId is provided, get messages between these two users
    if (otherUserId) {
      messages = await db.message.findMany({
        where: {
          itemId,
          OR: [
            {
              AND: [
                { senderId: userId },
                { receiverId: otherUserId }
              ]
            },
            {
              AND: [
                { senderId: otherUserId },
                { receiverId: userId }
              ]
            }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Mark messages as read if they were sent to current user
      await db.message.updateMany({
        where: {
          itemId,
          senderId: otherUserId,
          receiverId: userId,
          read: false
        },
        data: {
          read: true
        }
      });
    } else {
      // If no otherUserId, get all messages for this item (for seller to find buyers)
      messages = await db.message.findMany({
        where: {
          itemId,
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Mark all unread messages sent to current user as read
      await db.message.updateMany({
        where: {
          itemId,
          receiverId: userId,
          read: false
        },
        data: {
          read: true
        }
      });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
