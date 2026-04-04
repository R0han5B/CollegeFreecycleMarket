import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
