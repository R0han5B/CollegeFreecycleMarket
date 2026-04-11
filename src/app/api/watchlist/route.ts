import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const watchlist = await db.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          include: {
            category: true,
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      watchlist: watchlist.filter((entry) => entry.item),
      count: watchlist.length,
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemId } = body;

    if (!userId || !itemId) {
      return NextResponse.json(
        { error: 'User ID and item ID are required' },
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

    if (existingEntry) {
      return NextResponse.json({
        success: true,
        saved: true,
        watchlistItem: existingEntry,
      });
    }

    const watchlistItem = await db.watchlist.create({
      data: {
        userId,
        itemId,
      },
    });

    return NextResponse.json({
      success: true,
      saved: true,
      watchlistItem,
    });
  } catch (error) {
    console.error('Create watchlist error:', error);
    return NextResponse.json(
      { error: 'Failed to save item to cart' },
      { status: 500 }
    );
  }
}
