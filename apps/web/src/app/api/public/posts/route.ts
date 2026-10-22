import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe } from '@/lib/safe-store';
import { PostItem } from '@/app/api/posts/route';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '6', 10));

  const allPosts = readJsonSafe<PostItem[]>('posts.json', []);

  // Filter only published
  let published = allPosts.filter((p) => p.isPublished);

  // Filter by type if provided and not ALL
  if (type && type !== 'ALL') {
    published = published.filter((p) => p.type === type);
  }

  const total = published.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const pagedItems = published.slice(startIndex, startIndex + limit);

  const formattedItems = pagedItems.map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    type: p.type,
    eventDate: p.eventDate || null,
    publishedAt: p.publishedAt,
    thumbUrl: null,
  }));

  return NextResponse.json({
    data: formattedItems,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  });
}
