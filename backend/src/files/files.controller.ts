import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile as MulterFile,
  Res,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { FilesService } from './files.service';
import { StorageService } from './storage.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { FilePurpose } from '@prisma/client';

@Controller()
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly storage: StorageService,
  ) {}

  @Post('uploads')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @MulterFile() file: Express.Multer.File,
    @Body('purpose') purposeStr: string,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'No file provided in form-data "file"' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const purpose = (purposeStr as FilePurpose) || FilePurpose.application_attachment;
    const uploaded = await this.filesService.uploadFile(file, purpose, userId || 'system');
    return { id: uploaded.id };
  }

  @Get('files/:signedToken')
  async getFile(
    @Param('signedToken') token: string,
    @Res() res: Response,
  ) {
    const { file, downloadUrl } = await this.filesService.resolveSignedDownloadToken(token);

    res.setHeader('Cache-Control', 'private, no-store');
    if (!file.mimeType.startsWith('image/')) {
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    }

    if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
      return res.redirect(302, downloadUrl);
    }

    // Local file retrieval
    const { buffer, contentType } = await this.storage.getObject(file.storageKey);
    res.setHeader('Content-Type', contentType);
    return res.send(buffer);
  }

  @Public()
  @Get('files/raw/:key')
  async getRawLocalFile(
    @Param('key') key: string,
    @Res() res: Response,
  ) {
    try {
      const decodedKey = decodeURIComponent(key);
      const { buffer, contentType } = await this.storage.getObject(decodedKey);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('Content-Type', contentType);
      return res.send(buffer);
    } catch {
      throw new HttpException({ code: 'NOT_FOUND', message: 'File not found' }, HttpStatus.NOT_FOUND);
    }
  }
}
