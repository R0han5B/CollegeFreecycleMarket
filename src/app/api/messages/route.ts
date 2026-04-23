import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPusherServer, getUserChannelName, hasPusherServerEnv, PUSHER_EVENTS } from '@/lib/pusher-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, itemId, content, imageUrl } = body;

    if (!senderId || !receiverId || !itemId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // At least content or imageUrl must be provided
    if (!content && !imageUrl) {
      return NextResponse.json(
        { error: 'Message must have content or image' },
        { status: 400 }
      );
    }

    // Create message
    const message = await db.message.create({
      data: {
        senderId,
        receiverId,
        itemId,
        content: content || null,
        imageUrl: imageUrl || null
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
      }
    });

    if (hasPusherServerEnv()) {
      try {
        const pusher = getPusherServer();

        await pusher?.trigger(getUserChannelName(receiverId), PUSHER_EVENTS.messageCreated, {
          message,
        });

        await pusher?.trigger(getUserChannelName(senderId), PUSHER_EVENTS.messageCreated, {
          message,
        });
      } catch (error) {
        console.error('Error triggering Pusher message event:', error);
      }
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, userId } = body;

    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'Message ID and user ID are required' },
        { status: 400 }
      );
    }

    const existingMessage = await db.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        itemId: true,
      },
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (existingMessage.senderId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }

    await db.message.delete({
      where: { id: messageId },
    });

    if (hasPusherServerEnv()) {
      try {
        const pusher = getPusherServer();
        const payload = {
          messageId: existingMessage.id,
          itemId: existingMessage.itemId,
          senderId: existingMessage.senderId,
          receiverId: existingMessage.receiverId,
        };

        await pusher?.trigger(getUserChannelName(existingMessage.senderId), PUSHER_EVENTS.messageDeleted, payload);
        await pusher?.trigger(getUserChannelName(existingMessage.receiverId), PUSHER_EVENTS.messageDeleted, payload);
      } catch (error) {
        console.error('Error triggering Pusher message delete event:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
