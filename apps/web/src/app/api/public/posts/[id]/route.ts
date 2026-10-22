import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe, writeJsonSafe } from '@/lib/safe-store';
import { PostItem } from '@/app/api/posts/route';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const allPosts = readJsonSafe<PostItem[]>('posts.json', []);
  const post = allPosts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ message: 'E’lon topilmadi' }, { status: 404 });
  }

  // Increment views count asynchronously
  post.viewsCount = (post.viewsCount || 0) + 1;
  writeJsonSafe('posts.json', allPosts).catch(() => {});

  return NextResponse.json({
    id: post.id,
    title: post.title,
    body: post.content || post.excerpt,
    type: post.type,
    eventDate: post.eventDate || null,
    publishedAt: post.publishedAt,
    imageUrl: null,
    viewsCount: post.viewsCount,
  });
}
