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
import { AttendanceService } from './attendance.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, AttendanceStatus } from '@prisma/client';
import { SafeUser } from '@neom/shared';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MarkAttendanceDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  classId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string; // YYYY-MM-DD

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

class AttendanceItemDto {
  @IsUUID()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

class BulkAttendanceDto {
  @IsUUID()
  classId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string; // YYYY-MM-DD

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceItemDto)
  records!: AttendanceItemDto[];
}

class SubmitAttendanceDto {
  @IsUUID()
  classId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;
}

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('my-class')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: "Sinf rahbari o'z sinfi va bugungi davomatini olish" })
  async getMyClass(
    @CurrentUser() user: SafeUser,
    @Query('date') date?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getMyClassAttendance(user.id, targetDate);
  }

  @Get('class/:classId')
  @Roles(Role.DIRECTOR, Role.ZAVUCH, Role.TEACHER)
  @ApiOperation({ summary: "Sinf bo'yicha berilgan kungi davomat" })
  async getClassAttendance(
    @Param('classId') classId: string,
    @Query('date') date: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getClassAttendance(classId, targetDate);
  }

  @Get('summary')
  @Roles(Role.DIRECTOR, Role.ZAVUCH, Role.TEACHER)
  @ApiOperation({ summary: 'Kunlik umumiy davomat statistikasi' })
  async getSummary(
    @Query('date') date: string,
    @Query('classId') classId?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getDailySummary(targetDate, classId);
  }

  @Get('zavuch/dashboard')
  @Roles(Role.ZAVUCH, Role.DIRECTOR)
  @ApiOperation({ summary: "Zavuch bosh paneli uchun umumiy davomat va sinflar monitoringi" })
  async getZavuchDashboard(@Query('date') date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getZavuchDashboard(targetDate);
  }

  @Get('director/overview')
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Direktor nazorat paneli uchun maktab monitoringi' })
  async getDirectorOverview(@Query('date') date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getDirectorOverview(targetDate);
  }

  @Post('mark')
  @Roles(Role.TEACHER, Role.ZAVUCH)
  @ApiOperation({ summary: "Bitta o'quvchi davomatini belgilash" })
  async markItem(
    @Body() body: MarkAttendanceDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.attendanceService.markAttendanceItem({
      ...body,
      dateStr: body.date,
      markedById: user?.id || 'system',
    });
  }

  @Post('bulk')
  @Roles(Role.TEACHER, Role.ZAVUCH)
  @ApiOperation({ summary: "Butun sinf davomatini bir so'rovda saqlash" })
  async bulkMark(
    @Body() body: BulkAttendanceDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.attendanceService.bulkMarkAttendance({
      classId: body.classId,
      dateStr: body.date,
      records: body.records,
      markedById: user?.id || 'system',
    });
  }

  @Post('submit')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Sinf davomatini zavuchga yuborish' })
  async submitClass(@Body() body: SubmitAttendanceDto) {
    return this.attendanceService.submitClassAttendance(body.classId, body.date);
  }
}
