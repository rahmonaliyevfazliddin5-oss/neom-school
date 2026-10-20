import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFileDto {
  filename?: string;
  mimetype?: string;
  size?: number;
}

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadsDir = path.resolve(process.cwd(), 'uploads');

  onModuleInit() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      this.logger.log(`Created uploads directory at ${this.uploadsDir}`);
    }
  }

  getUploadsDir(): string {
    return this.uploadsDir;
  }

  /**
   * Safely resolve a media filename with strict path traversal protection
   */
  resolveSafeFilePath(filename: string): string {
    // 1. Basic sanitization checks
    if (!filename || typeof filename !== 'string') {
      throw new BadRequestException("Noto'g'ri fayl nomi");
    }

    // Reject null bytes, path separators, parent directory markers
    if (
      filename.includes('\0') ||
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      throw new BadRequestException("Ruxsat etilmagan fayl yo'li (Path traversal)");
    }

    // 2. Strict path resolution & bounds check
    const resolvedPath = path.resolve(this.uploadsDir, filename);
    const normalizedUploadsDir = path.normalize(this.uploadsDir) + path.sep;

    if (!resolvedPath.startsWith(normalizedUploadsDir) && resolvedPath !== path.normalize(this.uploadsDir)) {
      throw new BadRequestException("Ruxsat etilmagan fayl yo'li (Path traversal)");
    }

    // 3. Existence check
    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
      throw new NotFoundException("Fayl topilmadi");
    }

    return resolvedPath;
  }

  async handleFileUpload(file?: UploadedFileDto) {
    return {
      filename: file?.filename || 'sample-upload.png',
      url: `/media/${file?.filename || 'sample-upload.png'}`,
      mimetype: file?.mimetype || 'image/png',
      size: file?.size || 1024,
      uploadedAt: new Date().toISOString(),
    };
  }
}
