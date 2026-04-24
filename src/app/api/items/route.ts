import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildSearchTokens, dedupeTerms, generateSuggestedTags, tokenize } from '@/lib/item-tags';

const objectIdPattern = /^[a-fA-F0-9]{24}$/;

function matchesSearch(item: { title: string; description: string; tags: string[] }, query: string) {
  const queryTokens = dedupeTerms(tokenize(query));

  if (queryTokens.length === 0) {
    return true;
  }

  const searchableTokens = buildSearchTokens(item);
  return queryTokens.every((token) => searchableTokens.has(token));
}

function getSearchScore(item: { title: string; description: string; tags: string[] }, query: string) {
  const queryTokens = dedupeTerms(tokenize(query));
  const titleTokens = new Set(tokenize(item.title));
  const descriptionTokens = new Set(tokenize(item.description));
  const tagTokens = new Set((item.tags ?? []).flatMap((tag) => tokenize(tag)));

  return queryTokens.reduce((score, token) => {
    if (titleTokens.has(token)) return score + 5;
    if (tagTokens.has(token)) return score + 4;
    if (descriptionTokens.has(token)) return score + 2;
    return score;
  }, 0);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: { isSold: boolean; categoryId?: string; isFeatured?: boolean } = {
      isSold: false,
    };

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

    const trimmedSearch = search?.trim() ?? '';
    const filteredItems = trimmedSearch
      ? items
          .filter((item) => matchesSearch(item, trimmedSearch))
          .sort((a, b) => getSearchScore(b, trimmedSearch) - getSearchScore(a, trimmedSearch))
      : items;

    return NextResponse.json({ items: filteredItems });
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
    const { title, description, price, condition, categoryId, sellerId, image, images, tags } = body;

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

    const categoryRecord = objectIdPattern.test(categoryId)
      ? await db.category.findUnique({
          where: { id: categoryId },
          select: { name: true },
        })
      : null;

    const normalizedTags = dedupeTerms(Array.isArray(tags) ? tags : []);
    const suggestedTags = await generateSuggestedTags({
      title,
      description,
      categoryName: categoryRecord?.name,
      existingTags: normalizedTags,
    });

    const item = await db.item.create({
      data: {
        title,
        description,
        tags: dedupeTerms([...normalizedTags, ...suggestedTags]).slice(0, 12),
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
