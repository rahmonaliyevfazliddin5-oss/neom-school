import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PublicCacheService } from './public-cache.service';
import { PrismaModule } from '../../common/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PublicController],
  providers: [PublicService, PublicCacheService],
  exports: [PublicService, PublicCacheService],
})
export class PublicModule {}
