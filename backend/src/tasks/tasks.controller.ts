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
import { TasksService } from './tasks.service';
import { MemberGuard } from '../common/guards/member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TaskKind, TaskPriority, TaskStatus } from '@prisma/client';

@UseGuards(MemberGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(
    @CurrentUser('id') ownerId: string,
    @Query('status') status?: string,
    @Query('kind') kind?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.tasksService.getTasks(ownerId, { status, kind, from, to });
  }

  @Post()
  async createTask(
    @CurrentUser('id') ownerId: string,
    @Body() body: {
      title: string;
      notes?: string;
      kind?: TaskKind;
      dueAt?: string;
      priority?: TaskPriority;
      reminderAt?: string;
    },
  ) {
    return this.tasksService.createTask(ownerId, body);
  }

  @Patch(':id')
  async updateTask(
    @Param('id') taskId: string,
    @CurrentUser('id') ownerId: string,
    @Body() body: any,
  ) {
    return this.tasksService.updateTask(taskId, ownerId, body);
  }

  @Delete(':id')
  async deleteTask(
    @Param('id') taskId: string,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.tasksService.deleteTask(taskId, ownerId);
  }
}
