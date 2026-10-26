import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile as MulterFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ProfilesService } from './profiles.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MemberGuard } from '../common/guards/member.guard';
import { Public } from '../common/decorators/public.decorator';

@UseGuards(MemberGuard)
@Controller()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('profiles')
  async getDirectory(
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('sector') sector?: string,
    @Query('expertise') expertise?: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.profilesService.getDirectory({
      q,
      role,
      sector,
      expertise,
      location,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      viewerId: viewerId!,
    });
  }

  @Public()
  @Get('profiles/stats')
  async getCommunityStats() {
    return this.profilesService.getCommunityStats();
  }

  @Get('profiles/:id')
  async getProfile(
    @Param('id') targetId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const isAdmin = !!user.adminLevel && user.session?.mfaVerified;
    return this.profilesService.getProfileById(targetId, user.id, isAdmin, clientIp);
  }

  @Get('me/profile')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.profilesService.getMyProfile(userId);
  }

  @Patch('me/profile')
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() body: Record<string, any>,
  ) {
    return this.profilesService.updateMyProfile(userId, body);
  }

  @Patch('me/privacy')
  async updatePrivacy(
    @CurrentUser('id') userId: string,
    @Body() body: { visibility?: any; contactPreferences?: any },
  ) {
    return this.profilesService.updatePrivacy(userId, body);
  }

  @Post('me/profile/photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @CurrentUser('id') userId: string,
    @MulterFile() file: Express.Multer.File,
  ) {
    return this.profilesService.uploadPhoto(userId, file);
  }

  @Get('me/documents')
  async getMyDocuments(@CurrentUser('id') userId: string) {
    return this.profilesService.getMyDocuments(userId);
  }

  @Post('me/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @CurrentUser('id') userId: string,
    @MulterFile() file: Express.Multer.File,
    @Body('category') category?: string,
  ) {
    return this.profilesService.uploadDocument(userId, file, category);
  }

  @Delete('me/documents/:id')
  async deleteDocument(
    @CurrentUser('id') userId: string,
    @Param('id') fileId: string,
  ) {
    return this.profilesService.deleteDocument(userId, fileId);
  }
}
