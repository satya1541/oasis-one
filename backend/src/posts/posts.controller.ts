import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MemberGuard } from '../common/guards/member.guard';
import { PostType, ReportReasonCategory, ReportTargetType } from '@prisma/client';

@UseGuards(MemberGuard)
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('posts')
  async getPosts(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('status') status?: string,
    @Query('feed') feed?: 'relevant' | 'recent',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.postsService.getPosts({
      category,
      tag,
      status,
      feed,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      viewerId: viewerId!,
    });
  }

  @Post('posts')
  async createPost(
    @CurrentUser('id') userId: string,
    @Body() body: { title: string; body: string; category?: string; type?: PostType; tags?: string[] },
  ) {
    return this.postsService.createPost(userId, body);
  }

  @Get('posts/:id')
  async getPost(
    @Param('id') postId: string,
    @CurrentUser('id') viewerId: string,
  ) {
    return this.postsService.getPostById(postId, viewerId);
  }

  @Patch('posts/:id')
  async updatePost(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @Body('body') newBody: string,
  ) {
    return this.postsService.updatePost(postId, userId, newBody);
  }

  @Delete('posts/:id')
  async deletePost(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.deletePost(postId, userId);
  }

  @Get('posts/:id/responses')
  async getResponses(@Param('id') postId: string) {
    return this.postsService.getResponses(postId);
  }

  @Post('posts/:id/responses')
  async createResponse(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @Body('body') body: string,
  ) {
    return this.postsService.createResponse(postId, userId, body);
  }

  @Post('posts/:id/resolve')
  async resolvePost(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @Body('acceptedResponseId') acceptedResponseId?: string,
  ) {
    return this.postsService.resolvePost(postId, userId, acceptedResponseId);
  }

  @Post('reports')
  async createReport(
    @CurrentUser('id') userId: string,
    @Body() body: {
      targetType: ReportTargetType;
      targetId: string;
      reasonCategory: ReportReasonCategory;
      reasonDetail?: string;
    },
  ) {
    return this.postsService.createReport(userId, body);
  }
}
