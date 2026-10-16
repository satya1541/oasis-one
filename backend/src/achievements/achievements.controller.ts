import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile as MulterFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AchievementsService } from './achievements.service';
import { MemberGuard } from '../common/guards/member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(MemberGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('active')
  async getActive() {
    return this.achievementsService.getActiveAchievements();
  }

  @Get('mine')
  async getMine(@CurrentUser('id') userId: string) {
    return this.achievementsService.getMyAchievements(userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @CurrentUser('id') userId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @MulterFile() file?: Express.Multer.File,
  ) {
    return this.achievementsService.createAchievement(userId, title, description, file);
  }
}
