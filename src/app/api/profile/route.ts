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

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isAdmin: true,
        credits: true,
        createdAt: true,
        items: {
          include: {
            category: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, phone } = body;

    const user = await db.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isAdmin: true,
        credits: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userItems = await db.item.findMany({
      where: { sellerId: userId },
      select: { id: true },
    });

    const itemIds = userItems.map((item) => item.id);

    if (itemIds.length > 0) {
      await db.message.deleteMany({
        where: { itemId: { in: itemIds } },
      });

      await db.rating.deleteMany({
        where: { itemId: { in: itemIds } },
      });

      await db.payment.deleteMany({
        where: { itemId: { in: itemIds } },
      });

      await db.watchlist.deleteMany({
        where: { itemId: { in: itemIds } },
      });

      await db.report.deleteMany({
        where: { itemId: { in: itemIds } },
      });

      await db.item.deleteMany({
        where: { id: { in: itemIds } },
      });
    }

    await db.message.deleteMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
    });

    await db.rating.deleteMany({
      where: {
        OR: [
          { raterId: userId },
          { ratedId: userId },
        ],
      },
    });

    await db.payment.deleteMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
    });

    await db.watchlist.deleteMany({
      where: { userId },
    });

    await db.report.deleteMany({
      where: { userId },
    });

    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete profile error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
