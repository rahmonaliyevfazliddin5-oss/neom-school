import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, PostType } from '@prisma/client';
import { SafeUser } from '@neom/shared';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreatePostDto {
  @IsEnum(PostType)
  type!: PostType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @IsString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Mehmon sahifa uchun e’lon qilingan yangilik va tadbirlar' })
  async getPublicPosts(
    @Query('type') type?: PostType,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getPublishedPosts(type, limit ? Number(limit) : 10);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(Role.DIRECTOR, Role.ZAVUCH)
  @ApiOperation({ summary: "Barcha yangilik, tadbir va rejalar ro'yxati (Zavuch va Direktor)" })
  async getAllPosts(@Query('type') type?: PostType) {
    return this.postsService.getAllPosts(type);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.DIRECTOR, Role.ZAVUCH)
  @ApiOperation({ summary: "Yangi yozuv qo'shish" })
  async createPost(
    @Body() body: CreatePostDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.postsService.createPost({
      ...body,
      createdById: user?.id || 'system',
    });
  }
}
