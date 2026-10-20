import { Injectable } from '@nestjs/common';
import { PrismaService, safeUserSelect } from '../../common/database/prisma.service';
import { PostType, Prisma } from '@prisma/client';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(type?: PostType, limit = 10) {
    const where: Prisma.PostWhereInput = {
      isPublished: true,
      ...(type ? { type } : {}),
    };

    return this.prisma.post.findMany({
      where,
      include: {
        createdBy: { select: safeUserSelect },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  async findAll(type?: PostType) {
    return this.prisma.post.findMany({
      where: type ? { type } : undefined,
      include: {
        createdBy: { select: safeUserSelect },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { createdBy: { select: safeUserSelect } },
    });
  }

  async create(data: {
    type: PostType;
    title: string;
    body: string;
    eventDate?: Date;
    imageUrl?: string;
    thumbUrl?: string;
    isPublished?: boolean;
    createdById: string;
  }) {
    return this.prisma.post.create({
      data: {
        type: data.type,
        title: data.title,
        body: data.body,
        eventDate: data.eventDate,
        imageUrl: data.imageUrl,
        thumbUrl: data.thumbUrl,
        isPublished: data.isPublished ?? false,
        publishedAt: data.isPublished ? new Date() : null,
        createdById: data.createdById,
      },
      include: { createdBy: { select: safeUserSelect } },
    });
  }
}
