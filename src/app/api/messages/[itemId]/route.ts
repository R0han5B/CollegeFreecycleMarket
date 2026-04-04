import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const otherUserId = searchParams.get('otherUserId');

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { error: 'Missing user IDs' },
        { status: 400 }
      );
    }

    // Get messages between current user and other user for this item
    const messages = await db.message.findMany({
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

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
