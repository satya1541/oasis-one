import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { MemberGuard } from '../common/guards/member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(MemberGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q: string,
    @Query('type') type: 'people' | 'posts' | 'events' | undefined,
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @CurrentUser('id') viewerId: string,
  ) {
    return this.searchService.search({
      q: q || '',
      type,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      viewerId,
    });
  }
}
