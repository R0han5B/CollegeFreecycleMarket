import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: any = {
      isSold: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const items = await db.item.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, price, condition, categoryId, sellerId, image, images } = body;
    const normalizedImages = Array.isArray(images)
      ? images.filter((imageUrl): imageUrl is string => typeof imageUrl === 'string' && imageUrl.trim().length > 0)
      : image
        ? [image]
        : [];

    const item = await db.item.create({
      data: {
        title,
        description,
        price: parseInt(price),
        condition,
        categoryId,
        sellerId,
        image: normalizedImages[0] ?? null,
        images: normalizedImages,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
