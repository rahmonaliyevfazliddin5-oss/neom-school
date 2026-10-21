import {
  SiteSettingsResponseDto,
  PublicPostListItemDto,
  PublicPostDetailDto,
  PaginatedResult,
} from '@neom/shared';

const getApiBaseUrl = (): string | null => {
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.NODE_ENV === 'production') return null;
  return 'http://localhost:3001/api';
};

export async function fetchPublicSettings(): Promise<SiteSettingsResponseDto> {
  const fallback: SiteSettingsResponseDto = {
    stats: {
      teachers: null,
      students: null,
      classrooms: null,
      graduatesRate: null,
    },
    address: null,
    phone: null,
    workHours: null,
  };

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return fallback;

  try {
    const res = await fetch(`${baseUrl}/public/settings`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return fallback;
    const data = await res.json();
    return data || fallback;
  } catch (err) {
    // Return placeholder data gracefully on network error (never crash the page)
    return fallback;
  }
}

export async function fetchPublicPosts(
  type?: string,
  page = 1,
  limit = 6,
): Promise<PaginatedResult<PublicPostListItemDto>> {
  const fallbackPosts: PublicPostListItemDto[] = [
    {
      id: 'placeholder-1',
      type: 'EVENT' as any,
      title: '[Sarlavha]',
      excerpt: '[Sana · qisqa matn]',
      eventDate: null,
      thumbUrl: null,
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'placeholder-2',
      type: 'NEWS' as any,
      title: '[Sarlavha]',
      excerpt: '[Sana · qisqa matn]',
      eventDate: null,
      thumbUrl: null,
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'placeholder-3',
      type: 'PLAN' as any,
      title: '[Sarlavha]',
      excerpt: '[Sana · qisqa matn]',
      eventDate: null,
      thumbUrl: null,
      publishedAt: new Date().toISOString(),
    },
  ];

  const fallback: PaginatedResult<PublicPostListItemDto> = {
    data: fallbackPosts,
    meta: {
      total: fallbackPosts.length,
      page,
      limit,
      totalPages: 1,
    },
  };

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return fallback;

  try {
    const query = new URLSearchParams();
    if (type && type !== 'ALL') query.set('type', type);
    query.set('page', String(page));
    query.set('limit', String(limit));

    const res = await fetch(`${baseUrl}/public/posts?${query.toString()}`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return fallback;
    const json = await res.json();
    if (!json || !Array.isArray(json.data) || json.data.length === 0) {
      return fallback;
    }
    return json;
  } catch (err) {
    return fallback;
  }
}

export async function fetchPublicPostById(
  id: string,
): Promise<PublicPostDetailDto | null> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}/public/posts/${id}`, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}
