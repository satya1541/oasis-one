import { Controller, Post, Body } from '@nestjs/common';
import { SupportService } from './support.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('contact')
  async submitContact(
    @CurrentUser() user: any,
    @Body() body: { category: string; subject: string; message: string; email?: string },
  ) {
    const email = user?.email || body?.email || 'guest@oasis.community';
    return this.supportService.submitContact(user?.id, email, body);
  }
}
