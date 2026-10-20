import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsUUID()
  classId!: string;
}

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('by-class/:classId')
  @Roles(Role.DIRECTOR, Role.ZAVUCH, Role.TEACHER)
  @ApiOperation({ summary: "Sinf o'quvchilari ro'yxati" })
  async getStudentsByClass(@Param('classId') classId: string) {
    return this.studentsService.getStudentsByClass(classId);
  }

  @Post()
  @Roles(Role.DIRECTOR, Role.ZAVUCH)
  @ApiOperation({ summary: "Yangi o'quvchi qo'shish" })
  async createStudent(@Body() body: CreateStudentDto) {
    return this.studentsService.createStudent(body);
  }
}
