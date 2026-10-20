import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Platforma salomatligi holati (DB va Redis)' })
  @ApiResponse({ status: 200, description: 'Barcha servislar ishlayapti' })
  @ApiResponse({ status: 503, description: 'Bir yoki bir nechta servisda nosozlik' })
  async getHealth(@Res() res: Response) {
    const health = await this.healthService.checkHealth();
    const httpStatus =
      health.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(httpStatus).json(health);
  }
}
