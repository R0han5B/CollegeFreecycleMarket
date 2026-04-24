import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dedupeTerms, generateSuggestedTags } from '@/lib/item-tags';

const objectIdPattern = /^[a-fA-F0-9]{24}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title : '';
    const description = typeof body.description === 'string' ? body.description : '';
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : '';
    const existingTags = Array.isArray(body.tags) ? dedupeTerms(body.tags) : [];

    const categoryRecord = objectIdPattern.test(categoryId)
      ? await db.category.findUnique({
          where: { id: categoryId },
          select: { name: true },
        })
      : null;

    const tags = await generateSuggestedTags({
      title,
      description,
      categoryName: categoryRecord?.name,
      existingTags,
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Tag suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to suggest tags' },
      { status: 500 }
    );
  }
}
