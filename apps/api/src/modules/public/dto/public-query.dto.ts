import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '@prisma/client';

export class PublicPostsQueryDto {
  @ApiPropertyOptional({ enum: PostType, description: 'Eʼlon turi bo‘yicha filtr' })
  @IsOptional()
  @IsEnum(PostType, { message: "Type faqat NEWS, EVENT yoki PLAN bo'lishi mumkin" })
  type?: PostType;

  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Sahifa raqami' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 6, minimum: 1, maximum: 50, description: 'Sahifadagi elementlar soni' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 6;
}
