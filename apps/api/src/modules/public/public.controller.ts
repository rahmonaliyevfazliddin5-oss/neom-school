import {
  Controller,
  Get,
  Param,
  Query,
  Header,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PublicService } from './public.service';
import { PublicPostsQueryDto } from './dto/public-query.dto';

@ApiTags('Public')
@Controller('public')
@Throttle({ default: { limit: 120, ttl: 60000 } })
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Maktab ochiq statistikasi va aloqa maʼlumotlari' })
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  async getSettings() {
    return this.publicService.getSettings();
  }

  @Get('posts')
  @ApiOperation({ summary: 'Eʼlon qilingan yangiliklar, tadbirlar va rejalar ro‘yxati' })
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPosts(@Query() query: PublicPostsQueryDto) {
    return this.publicService.getPosts(query);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Bitta eʼlonning to‘liq matni va rasmi' })
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  async getPostById(@Param('id') id: string) {
    return this.publicService.getPostById(id);
  }
}
