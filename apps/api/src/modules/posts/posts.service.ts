import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostType } from '@prisma/client';
import { PublicCacheService } from '../public/public-cache.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    @Inject(forwardRef(() => PublicCacheService))
    private readonly publicCache: PublicCacheService,
  ) {}

  async getPublishedPosts(type?: PostType, limit?: number) {
    return this.postsRepository.findPublished(type, limit);
  }

  async getAllPosts(type?: PostType) {
    return this.postsRepository.findAll(type);
  }

  async getPostById(id: string) {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new NotFoundException("Maqola topilmadi");
    }
    return post;
  }

  async createPost(data: {
    type: PostType;
    title: string;
    body: string;
    eventDate?: string;
    imageUrl?: string;
    thumbUrl?: string;
    isPublished?: boolean;
    createdById: string;
  }) {
    const post = await this.postsRepository.create({
      ...data,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
    });
    await this.publicCache.invalidatePostsCache();
    return post;
  }
}
