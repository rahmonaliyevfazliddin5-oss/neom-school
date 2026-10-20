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
import { ClassesService } from './classes.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

class CreateClassDto {
  @IsInt()
  @Min(1)
  @Max(11)
  grade!: number;

  @IsString()
  @IsNotEmpty()
  letter!: string;

  @IsUUID()
  academicYearId!: string;

  @IsOptional()
  @IsUUID()
  homeroomTeacherId?: string;
}

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @Roles(Role.DIRECTOR, Role.ZAVUCH, Role.TEACHER)
  @ApiOperation({ summary: "Sinflar ro'yxatini olish" })
  async getClasses(@Query('academicYearId') academicYearId?: string) {
    return this.classesService.getAllClasses(academicYearId);
  }

  @Get(':id')
  @Roles(Role.DIRECTOR, Role.ZAVUCH, Role.TEACHER)
  @ApiOperation({ summary: "Sinf ma'lumotlari va o'quvchilar ro'yxati" })
  async getClassById(@Param('id') id: string) {
    return this.classesService.getClassById(id);
  }

  @Post()
  @Roles(Role.DIRECTOR, Role.ZAVUCH)
  @ApiOperation({ summary: "Yangi sinf yaratish (Direktor va Zavuch)" })
  async createClass(@Body() body: CreateClassDto) {
    return this.classesService.createClass(body);
  }
}
