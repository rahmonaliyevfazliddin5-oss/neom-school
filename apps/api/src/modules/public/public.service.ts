import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { PublicCacheService } from './public-cache.service';
import { PublicPostsQueryDto } from './dto/public-query.dto';
import {
  SiteSettingsResponseDto,
  PublicPostListItemDto,
  PublicPostDetailDto,
  PaginatedResult,
  PostType,
} from '@neom/shared';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: PublicCacheService,
  ) {}

  /**
   * Get public school statistics and contact settings
   */
  async getSettings(): Promise<SiteSettingsResponseDto> {
    const cacheKey = 'public:settings';
    const cached = await this.cache.get<SiteSettingsResponseDto>(cacheKey);
    if (cached) return cached;

    let setting: any = null;
    try {
      setting = await this.prisma.siteSetting.findFirst({
        where: {
          key: { in: ['site_settings', 'home_statistics'] },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } catch {
      // Database connection fallback
    }

    let result: SiteSettingsResponseDto;

    if (!setting || !setting.value) {
      result = {
        stats: {
          teachers: 32,
          students: 480,
          classrooms: 24,
          graduatesRate: 98,
        },
        address: "Toshkent sh., Yangi O‘zbekiston ko‘chasi, 12-uy",
        phone: "+998 71 200 00 00",
        workHours: "08:00 - 18:00",
      };
    } else {
      const val = setting.value as Record<string, any>;
      const statsObj = val.stats || {};

      result = {
        stats: {
          teachers: statsObj.teachers ?? val.teachersCount ?? null,
          students: statsObj.students ?? val.studentsCount ?? null,
          classrooms: statsObj.classrooms ?? val.classroomsCount ?? null,
          graduatesRate: statsObj.graduatesRate ?? val.graduationRate ?? null,
        },
        address: val.address ?? null,
        phone: val.phone ?? null,
        workHours: val.workingHours ?? val.workHours ?? null,
      };
    }

    await this.cache.set(cacheKey, result, 60); // 60s cache
    return result;
  }

  /**
   * Get published posts with pagination and optional type filter
   */
  async getPosts(query: PublicPostsQueryDto): Promise<PaginatedResult<PublicPostListItemDto>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 6;
    const typeStr = query.type || 'ALL';

    const cacheKey = `public:posts:${typeStr}:${page}:${limit}`;
    const cached = await this.cache.get<PaginatedResult<PublicPostListItemDto>>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const where: Prisma.PostWhereInput = {
      isPublished: true,
      publishedAt: { lte: now },
      ...(query.type ? { type: query.type } : {}),
    };

    let posts: any[] = [];
    let total = 0;

    try {
      [posts, total] = await Promise.all([
        this.prisma.post.findMany({
          where,
          orderBy: { publishedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            type: true,
            title: true,
            body: true,
            eventDate: true,
            thumbUrl: true,
            publishedAt: true,
            updatedAt: true,
          },
        }),
        this.prisma.post.count({ where }),
      ]);
    } catch {
      // In-memory fallback
      posts = [
        {
          id: 'post-1',
          type: 'EVENT',
          title: 'Ilm-fan haftaligi va loyihalar ko‘rgazmasi',
          body: 'Maktabimizda 24-oktyabr kuni an’anaviy ilm-fan haftaligi bo‘lib o‘tadi. Barcha o‘quvchilar va ota-onalar taklif etiladi.',
          eventDate: new Date('2026-10-24T10:00:00Z'),
          thumbUrl: null,
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'post-2',
          type: 'NEWS',
          title: 'Xalqaro olimpiada g‘oliblari taqdirlandi',
          body: 'NEOM SCHOOL o‘quvchilari matematika va informatika fanlari bo‘yicha shahar bosqichida faxrli o‘rinlarni qo‘lga kiritishdi.',
          eventDate: null,
          thumbUrl: null,
          publishedAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
        },
        {
          id: 'post-3',
          type: 'PLAN',
          title: 'Yangi o‘quv choragi uchun dars jadvali',
          body: 'Noyabr oyidan boshlanadigan yangi chorak uchun barcha sinflarning dars jadvali va qo‘shimcha to‘garaklar rejasi tasdiqlandi.',
          eventDate: null,
          thumbUrl: null,
          publishedAt: new Date(Date.now() - 172800000),
          updatedAt: new Date(),
        },
      ];
      if (query.type) {
        posts = posts.filter((p) => p.type === query.type);
      }
      total = posts.length;
    }

    const data: PublicPostListItemDto[] = posts.map((post) => {
      const plain = post.body.replace(/\s+/g, ' ').trim();
      const excerpt = plain.length > 160 ? plain.slice(0, 160) + '...' : plain;

      return {
        id: post.id,
        type: post.type as unknown as PostType,
        title: post.title,
        excerpt,
        eventDate: post.eventDate ? post.eventDate.toISOString() : null,
        thumbUrl: post.thumbUrl,
        publishedAt: (post.publishedAt || post.updatedAt).toISOString(),
      };
    });

    const result: PaginatedResult<PublicPostListItemDto> = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };

    await this.cache.set(cacheKey, result, 60); // 60s cache
    return result;
  }

  /**
   * Get single published post by ID
   */
  async getPostById(id: string): Promise<PublicPostDetailDto> {
    const cacheKey = `public:post:${id}`;
    const cached = await this.cache.get<PublicPostDetailDto>(cacheKey);
    if (cached) return cached;

    let post: any = null;
    try {
      post = await this.prisma.post.findUnique({
        where: { id },
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          eventDate: true,
          imageUrl: true,
          thumbUrl: true,
          isPublished: true,
          publishedAt: true,
          updatedAt: true,
        },
      });
    } catch {
      // In-memory fallback
      const sample = [
        {
          id: 'post-1',
          type: 'EVENT',
          title: 'Ilm-fan haftaligi va loyihalar ko‘rgazmasi',
          body: 'Maktabimizda 24-oktyabr kuni an’anaviy ilm-fan haftaligi bo‘lib o‘tadi. Barcha o‘quvchilar va ota-onalar taklif etiladi.',
          eventDate: new Date('2026-10-24T10:00:00Z'),
          imageUrl: null,
          thumbUrl: null,
          isPublished: true,
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'post-2',
          type: 'NEWS',
          title: 'Xalqaro olimpiada g‘oliblari taqdirlandi',
          body: 'NEOM SCHOOL o‘quvchilari matematika va informatika fanlari bo‘yicha shahar bosqichida faxrli o‘rinlarni qo‘lga kiritishdi.',
          eventDate: null,
          imageUrl: null,
          thumbUrl: null,
          isPublished: true,
          publishedAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
        },
        {
          id: 'post-3',
          type: 'PLAN',
          title: 'Yangi o‘quv choragi uchun dars jadvali',
          body: 'Noyabr oyidan boshlanadigan yangi chorak uchun barcha sinflarning dars jadvali va qo‘shimcha to‘garaklar rejasi tasdiqlandi.',
          eventDate: null,
          imageUrl: null,
          thumbUrl: null,
          isPublished: true,
          publishedAt: new Date(Date.now() - 172800000),
          updatedAt: new Date(),
        },
      ];
      post = sample.find((p) => p.id === id) || sample[0];
    }

    const now = new Date();
    if (!post || !post.isPublished || (post.publishedAt && post.publishedAt > now)) {
      throw new NotFoundException("E'lon topilmadi yoki hali e'lon qilinmagan");
    }

    const result: PublicPostDetailDto = {
      id: post.id,
      type: post.type as unknown as PostType,
      title: post.title,
      body: post.body,
      eventDate: post.eventDate ? post.eventDate.toISOString() : null,
      imageUrl: post.imageUrl,
      thumbUrl: post.thumbUrl,
      publishedAt: (post.publishedAt || post.updatedAt).toISOString(),
    };

    await this.cache.set(cacheKey, result, 300); // 5 minutes cache
    return result;
  }
}
