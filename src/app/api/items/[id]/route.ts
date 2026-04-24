import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dedupeTerms, generateSuggestedTags } from '@/lib/item-tags';

const objectIdPattern = /^[a-fA-F0-9]{24}$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.item.findUnique({
      where: { id },
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
        ratings: {
          include: {
            rater: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingItem = await db.item.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    await db.$transaction([
      db.message.deleteMany({
        where: { itemId: id },
      }),
      db.rating.deleteMany({
        where: { itemId: id },
      }),
      db.watchlist.deleteMany({
        where: { itemId: id },
      }),
      db.report.deleteMany({
        where: { itemId: id },
      }),
      db.payment.deleteMany({
        where: { itemId: id },
      }),
      db.item.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isSold, title, description, price, condition, categoryId, image, images, tags } = body;

    if (
      typeof title === 'string' ||
      typeof description === 'string' ||
      typeof condition === 'string' ||
      typeof categoryId === 'string' ||
      typeof price === 'number' ||
      typeof price === 'string' ||
      Array.isArray(images) ||
      Array.isArray(tags) ||
      typeof image === 'string' ||
      image === null
    ) {
      const existingItem = await db.item.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          condition: true,
          categoryId: true,
          images: true,
          image: true,
        },
      });

      if (!existingItem) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      const nextTitle = typeof title === 'string' ? title : existingItem.title;
      const nextDescription = typeof description === 'string' ? description : existingItem.description;
      const nextCondition = typeof condition === 'string' ? condition : existingItem.condition;
      const nextCategoryId = typeof categoryId === 'string' ? categoryId : existingItem.categoryId;
      const nextPrice =
        typeof price === 'number'
          ? price
          : typeof price === 'string'
            ? parseInt(price, 10)
            : existingItem.price;

      if (Number.isNaN(nextPrice) || nextPrice < 0) {
        return NextResponse.json(
          { error: 'Price must be a valid non-negative number' },
          { status: 400 }
        );
      }

      const normalizedImages = Array.isArray(images)
        ? images.filter((imageUrl): imageUrl is string => typeof imageUrl === 'string' && imageUrl.trim().length > 0)
        : existingItem.images;
      const primaryImage =
        typeof image === 'string'
          ? image
          : image === null
            ? normalizedImages[0] ?? null
            : normalizedImages[0] ?? existingItem.image ?? null;
      const normalizedTags = dedupeTerms(Array.isArray(tags) ? tags : []);
      const categoryRecord = objectIdPattern.test(nextCategoryId)
        ? await db.category.findUnique({
            where: { id: nextCategoryId },
            select: { name: true },
          })
        : null;
      const suggestedTags = await generateSuggestedTags({
        title: nextTitle,
        description: nextDescription,
        categoryName: categoryRecord?.name,
        existingTags: normalizedTags,
      });

      const item = await db.item.update({
        where: { id },
        data: {
          title: nextTitle,
          description: nextDescription,
          price: nextPrice,
          condition: nextCondition,
          categoryId: nextCategoryId,
          image: primaryImage,
          images: normalizedImages,
          tags: dedupeTerms([...normalizedTags, ...suggestedTags]).slice(0, 12),
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

      return NextResponse.json({ item });
    }

    const item = await db.item.update({
      where: { id },
      data: { isSold },
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

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Update item error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}
