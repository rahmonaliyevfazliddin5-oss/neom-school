import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { UsersModule } from '../users/users.module';
import { SecurityModule } from '../../common/security/security.module';

@Module({
  imports: [UsersModule, SecurityModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
