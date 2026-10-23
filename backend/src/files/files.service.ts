import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { FilePurpose, UploadedFile } from '@prisma/client';

export interface FileValidationResult {
  detectedExt: string;
  detectedMime: string;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Validates file buffer by MIME type and magic bytes.
   */
  validateBuffer(buffer: Buffer, purpose: FilePurpose): FileValidationResult {
    // Magic bytes verification
    const isPng = buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPdf = buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;

    if (purpose === FilePurpose.profile_photo) {
      if (buffer.length > 2 * 1024 * 1024) {
        throw new HttpException(
          { code: 'VALIDATION_FAILED', message: 'Profile photo cannot exceed 2 MB' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      if (isPng) return { detectedExt: 'png', detectedMime: 'image/png' };
      if (isJpeg) return { detectedExt: 'jpg', detectedMime: 'image/jpeg' };
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Profile photo must be a valid JPEG or PNG file' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (purpose === FilePurpose.achievement_media) {
      if (buffer.length > 5 * 1024 * 1024) {
        throw new HttpException(
          { code: 'VALIDATION_FAILED', message: 'Achievement image cannot exceed 5 MB' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      if (isPng) return { detectedExt: 'png', detectedMime: 'image/png' };
      if (isJpeg) return { detectedExt: 'jpg', detectedMime: 'image/jpeg' };
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Achievement image must be a valid JPEG or PNG file' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (purpose === FilePurpose.application_attachment || purpose === FilePurpose.verification_evidence) {
      if (buffer.length > 10 * 1024 * 1024) {
        throw new HttpException(
          { code: 'VALIDATION_FAILED', message: 'Attachment file cannot exceed 10 MB' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      if (isPdf) return { detectedExt: 'pdf', detectedMime: 'application/pdf' };
      if (isPng) return { detectedExt: 'png', detectedMime: 'image/png' };
      if (isJpeg) return { detectedExt: 'jpg', detectedMime: 'image/jpeg' };
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Attachments must be a valid PDF, JPEG, or PNG file' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return { detectedExt: 'bin', detectedMime: 'application/octet-stream' };
  }

  /**
   * Uploads file, checks bytes, writes to storage, and saves DB record.
   */
  async uploadFile(
    file: Express.Multer.File,
    purpose: FilePurpose,
    userId: string | null,
  ): Promise<UploadedFile> {
    const { detectedExt, detectedMime } = this.validateBuffer(file.buffer, purpose);
    const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const fileId = uuidv4();
    const storageKey = `uploads/${purpose}/${userId || 'unregistered'}/${fileId}.${detectedExt}`;

    await this.storage.putObject(storageKey, file.buffer, detectedMime);

    return this.prisma.uploadedFile.create({
      data: {
        id: fileId,
        ownerId: userId || null,
        purpose,
        filename: file.originalname,
        storageKey,
        mimeType: detectedMime,
        sizeBytes: file.size,
        sha256,
        scanStatus: 'clean',
        status: 'pending',
      },
    });
  }

  async getFileById(id: string): Promise<UploadedFile | null> {
    return this.prisma.uploadedFile.findUnique({ where: { id } });
  }

  /**
   * Generates a signed access token for downloading/viewing a file.
   */
  generateSignedDownloadToken(fileId: string, userId: string, ttlSeconds = 300): string {
    const payload = JSON.stringify({
      fileId,
      userId,
      expiresAt: Math.floor(Date.now() / 1000) + ttlSeconds,
    });
    const cipher = crypto.createHmac('sha256', process.env.SESSION_SECRET || 'secret');
    const signature = cipher.update(payload).digest('hex');
    return Buffer.from(payload).toString('base64url') + '.' + signature;
  }

  /**
   * Resolves a signed download token to a file record and presigned download URL.
   */
  async resolveSignedDownloadToken(token: string): Promise<{ file: UploadedFile; downloadUrl: string }> {
    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new HttpException(
        { code: 'UNAUTHENTICATED', message: 'Invalid file access token' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const [b64Payload, signature] = parts;
    const payloadStr = Buffer.from(b64Payload, 'base64url').toString('utf8');
    const expectedSig = crypto
      .createHmac('sha256', process.env.SESSION_SECRET || 'secret')
      .update(payloadStr)
      .digest('hex');

    if (signature !== expectedSig) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Tampered file access token' },
        HttpStatus.FORBIDDEN,
      );
    }

    const payload = JSON.parse(payloadStr);
    if (payload.expiresAt < Math.floor(Date.now() / 1000)) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'File access token has expired' },
        HttpStatus.FORBIDDEN,
      );
    }

    const file = await this.prisma.uploadedFile.findUnique({
      where: { id: payload.fileId },
    });

    if (!file || file.status === 'deleted') {
      throw new HttpException(
        { code: 'NOT_FOUND', message: 'File not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const downloadUrl = await this.storage.getPresignedGetUrl(file.storageKey, 120);
    return { file, downloadUrl };
  }
}
