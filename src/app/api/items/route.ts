import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const objectIdPattern = /^[a-fA-F0-9]{24}$/;

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
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (category && objectIdPattern.test(category)) {
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

    if (!title || !description || !condition || !categoryId || !sellerId) {
      return NextResponse.json(
        { error: 'Title, description, condition, category, and seller are required' },
        { status: 400 }
      );
    }

    const parsedPrice =
      typeof price === 'number'
        ? price
        : typeof price === 'string'
          ? parseInt(price, 10)
          : 0;

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid non-negative number' },
        { status: 400 }
      );
    }

    const normalizedImages = Array.isArray(images)
      ? images.filter((imageUrl): imageUrl is string => typeof imageUrl === 'string' && imageUrl.trim().length > 0)
      : image
        ? [image]
        : [];

    const item = await db.item.create({
      data: {
        title,
        description,
        price: parsedPrice,
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
      { error: error instanceof Error ? error.message : 'Failed to create item' },
      { status: 500 }
    );
  }
}
