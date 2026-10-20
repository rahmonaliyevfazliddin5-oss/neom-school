import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role, SafeUser } from '@neom/shared';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.DIRECTOR as any, Role.ZAVUCH as any)
  @ApiOperation({ summary: "Foydalanuvchilar ro'yxati (Direktor va Zavuch uchun)" })
  async getUsers(@Query('role') role?: Role): Promise<SafeUser[]> {
    return this.usersService.getAllUsers(role);
  }

  @Get(':id')
  @ApiOperation({ summary: "Foydalanuvchi profil ma'lumotlari" })
  async getUserById(@Param('id') id: string): Promise<SafeUser> {
    return this.usersService.getProfile(id);
  }
}
