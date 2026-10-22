import {
  SiteSettingsResponseDto,
  PublicPostListItemDto,
  PublicPostDetailDto,
  PaginatedResult,
} from '@neom/shared';
import { readJsonSafe } from '@/lib/safe-store';
import { PostItem } from '@/app/api/posts/route';

export async function fetchPublicSettings(): Promise<SiteSettingsResponseDto> {
  const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
  const customUsers = readJsonSafe<any[]>('custom-users.json', []);
  const staff = readJsonSafe<any[]>('staff.json', []);

  const totalClasses = 18 + customClasses.length;
  const totalStudents = 480 + customClasses.reduce((acc, c) => acc + (c.studentsCount || 25), 0);
  const totalTeachers = staff.filter((s) => s.roleType === 'TEACHER').length + customUsers.length + 35;

  return {
    stats: {
      teachers: totalTeachers,
      students: totalStudents,
      classrooms: totalClasses,
      graduatesRate: 98,
    },
    address: 'Toshkent sh., Yunusobod tumani',
    phone: '+998 50 006 79 69',
    workHours: '08:00 - 18:00 (Dush - Shan)',
  };
}

export async function fetchPublicPosts(
  type?: string,
  page = 1,
  limit = 6,
): Promise<PaginatedResult<PublicPostListItemDto>> {
  const allPosts = readJsonSafe<PostItem[]>('posts.json', []);
  let published = allPosts.filter((p) => p.isPublished);

  if (type && type !== 'ALL') {
    published = published.filter((p) => p.type === type);
  }

  const total = published.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const pagedItems = published.slice(startIndex, startIndex + limit);

  const formattedItems: PublicPostListItemDto[] = pagedItems.map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    type: p.type as any,
    eventDate: p.eventDate || null,
    publishedAt: p.publishedAt,
    thumbUrl: null,
  }));

  return {
    data: formattedItems,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function fetchPublicPostById(
  id: string,
): Promise<PublicPostDetailDto | null> {
  const allPosts = readJsonSafe<PostItem[]>('posts.json', []);
  const post = allPosts.find((p) => p.id === id);

  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    body: post.content || post.excerpt,
    type: post.type as any,
    eventDate: post.eventDate || null,
    publishedAt: post.publishedAt,
    imageUrl: null,
    thumbUrl: null,
  };
}
