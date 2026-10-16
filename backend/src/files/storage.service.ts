import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageDriver {
  putObject(key: string, buffer: Buffer, contentType: string): Promise<void>;
  getObject(key: string): Promise<{ buffer: Buffer; contentType: string }>;
  getPresignedGetUrl(key: string, expiresInSeconds: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}

@Injectable()
export class StorageService implements StorageDriver {
  private readonly logger = new Logger(StorageService.name);
  private readonly driverType: string;
  private s3Client: S3Client | null = null;
  private readonly bucket: string;
  private readonly localDir: string;

  constructor(private readonly configService: ConfigService) {
    this.driverType = this.configService.get<string>('storage.driver') || 'local';
    this.bucket = this.configService.get<string>('storage.bucket') || 'oasis-uploads';
    this.localDir = path.resolve(process.cwd(), 'uploads');

    if (this.driverType === 's3') {
      const endpoint = this.configService.get<string>('storage.endpoint');
      const region = this.configService.get<string>('storage.region') || 'ap-south-1';
      const accessKeyId = this.configService.get<string>('storage.accessKey');
      const secretAccessKey = this.configService.get<string>('storage.secretKey');
      const forcePathStyle = this.configService.get<boolean>('storage.forcePathStyle') || false;

      this.s3Client = new S3Client({
        region,
        endpoint: endpoint || undefined,
        forcePathStyle,
        credentials: accessKeyId && secretAccessKey ? {
          accessKeyId,
          secretAccessKey,
        } : undefined,
      });
      this.logger.log(`Initialized S3 storage driver for bucket: ${this.bucket}`);
    } else {
      if (!fs.existsSync(this.localDir)) {
        fs.mkdirSync(this.localDir, { recursive: true });
      }
      this.logger.log(`Initialized Local storage driver at: ${this.localDir}`);
    }
  }

  async putObject(key: string, buffer: Buffer, contentType: string): Promise<void> {
    if (this.driverType === 's3' && this.s3Client) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ServerSideEncryption: this.configService.get<string>('storage.sse') as any || 'AES256',
        }),
      );
    } else {
      const filePath = path.join(this.localDir, key);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(filePath, buffer);
    }
  }

  async getObject(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    if (this.driverType === 's3' && this.s3Client) {
      const res = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      const stream = res.Body as any;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return {
        buffer: Buffer.concat(chunks),
        contentType: res.ContentType || 'application/octet-stream',
      };
    } else {
      const filePath = path.join(this.localDir, key);
      const buffer = await fs.promises.readFile(filePath);
      return {
        buffer,
        contentType: 'application/octet-stream',
      };
    }
  }

  async getPresignedGetUrl(key: string, expiresInSeconds = 120): Promise<string> {
    if (this.driverType === 's3' && this.s3Client) {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    } else {
      // Local signed URL routes through the API itself
      return `/api/v1/files/raw/${encodeURIComponent(key)}`;
    }
  }

  async deleteObject(key: string): Promise<void> {
    if (this.driverType === 's3' && this.s3Client) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } else {
      const filePath = path.join(this.localDir, key);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  }
}
