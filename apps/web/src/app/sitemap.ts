import { MetadataRoute } from 'next';
import { fetchPublicPosts } from '@/lib/api/public';

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://neom.school.uz';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    const postsResult = await fetchPublicPosts('ALL', 1, 50);
    const postRoutes: MetadataRoute.Sitemap = (postsResult.data || [])
      .filter((post) => !post.id.startsWith('placeholder-'))
      .map((post) => ({
        url: `${baseUrl}/yangiliklar/${post.id}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

    return [...staticRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
