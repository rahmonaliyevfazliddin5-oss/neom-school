import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe, writeJsonSafe } from '@/lib/safe-store';

export interface PostItem {
  id: string;
  title: string;
  type: 'NEWS' | 'EVENT' | 'PLAN';
  excerpt: string;
  content?: string;
  eventDate?: string;
  publishedAt: string;
  isPublished: boolean;
  viewsCount?: number;
}

export async function GET() {
  const posts = readJsonSafe<PostItem[]>('posts.json', []);
  return NextResponse.json({
    success: true,
    data: posts,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, type, excerpt, content, eventDate, isPublished } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Sarlavha kiritilishi shart' },
        { status: 400 }
      );
    }

    const posts = readJsonSafe<PostItem[]>('posts.json', []);
    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      type: type || 'NEWS',
      excerpt: excerpt?.trim() || title.trim(),
      content: content?.trim() || '',
      eventDate: type === 'EVENT' ? eventDate : undefined,
      publishedAt: new Date().toISOString(),
      isPublished: isPublished ?? true,
      viewsCount: 0,
    };

    const updated = [newPost, ...posts];
    await writeJsonSafe('posts.json', updated);

    return NextResponse.json({
      success: true,
      data: newPost,
      message: 'Muvaffaqiyatli saqlandi',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server xatoligi' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, title, type, excerpt, content, eventDate, isPublished } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Post ID ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    const posts = readJsonSafe<PostItem[]>('posts.json', []);
    const index = posts.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Post topilmadi' },
        { status: 404 }
      );
    }

    posts[index] = {
      ...posts[index],
      title: title?.trim() ?? posts[index].title,
      type: type ?? posts[index].type,
      excerpt: excerpt?.trim() ?? posts[index].excerpt,
      content: content?.trim() ?? posts[index].content,
      eventDate: type === 'EVENT' ? eventDate : undefined,
      isPublished: isPublished ?? posts[index].isPublished,
    };

    await writeJsonSafe('posts.json', posts);

    return NextResponse.json({
      success: true,
      data: posts[index],
      message: 'Post muvaffaqiyatli yangilandi',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server xatoligi' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Post ID ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    const posts = readJsonSafe<PostItem[]>('posts.json', []);
    const filtered = posts.filter((p) => p.id !== id);

    await writeJsonSafe('posts.json', filtered);

    return NextResponse.json({
      success: true,
      message: 'Post o‘chirildi',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server xatoligi' },
      { status: 500 }
    );
  }
}
