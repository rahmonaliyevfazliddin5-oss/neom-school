import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { globalValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const webOrigin = configService.get<string>('WEB_ORIGIN', 'http://localhost:3000');
  const cookieSecret = configService.get<string>('COOKIE_SECRET', 'neom_cookie_secret_fallback_key');

  // 1. JSON Body Size Limit (100 KB max as per security requirement)
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 2. Cookie Parser with Secret
  app.use(cookieParser(cookieSecret));

  // 3. Strict Security Headers via Helmet (CSP, frame-ancestors 'none', HSTS, Referrer-Policy 'no-referrer')
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          frameAncestors: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
        },
      },
      referrerPolicy: { policy: 'no-referrer' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // 4. Strict CORS Policy
  app.enableCors({
    origin: webOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-request-id'],
  });

  // 5. Global Filters, Interceptors, and Pipes
  app.useGlobalPipes(globalValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // 6. Global API Prefix (exclude health endpoint)
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  // 7. Swagger API Documentation (ONLY in non-production)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NEOM School Platform API')
      .setDescription(
        'NEOM School platformasi modulli monolit backend arxitekturasi va xavfsizlik spetsifikatsiyasi',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('Health', 'Tizim va servislar salomatligi')
      .addTag('Authentication', 'Kirish, sessiyalar va xavfsizlik')
      .addTag('Users', 'Foydalanuvchilar va profillar')
      .addTag('Classes', 'Sinflar boshqaruvi')
      .addTag('Students', 'O‘quvchilar ro‘yxati')
      .addTag('Attendance', 'Davomat va statistikalar')
      .addTag('Posts', 'Yangiliklar, tadbirlar va rejalar')
      .addTag('Media', 'Fayllar va rasmlar yuklash')
      .addTag('Audit', 'Xavfsizlik va audit jurnali')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    logger.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);
  }

  await app.listen(port);
  logger.log(`🚀 NEOM School API running on http://localhost:${port}`);
  logger.log(`🏥 Health check endpoint: http://localhost:${port}/health`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start NEOM School API:', err);
  process.exit(1);
});
