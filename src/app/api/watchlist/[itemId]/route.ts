import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const { itemId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const watchlistItem = await db.watchlist.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    return NextResponse.json({
      saved: !!watchlistItem,
    });
  } catch (error) {
    console.error('Check watchlist error:', error);
    return NextResponse.json(
      { error: 'Failed to check cart status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const { itemId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const existingEntry = await db.watchlist.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    if (!existingEntry) {
      return NextResponse.json({
        success: true,
        saved: false,
      });
    }

    await db.watchlist.delete({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      saved: false,
    });
  } catch (error) {
    console.error('Delete watchlist error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
