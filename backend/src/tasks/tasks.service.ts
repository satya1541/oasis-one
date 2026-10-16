import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskKind, TaskPriority, TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getTasks(ownerId: string, params: {
    status?: string;
    kind?: string;
    from?: string;
    to?: string;
  }) {
    const where: any = { ownerId };
    if (params.status && params.status !== 'all') {
      where.status = params.status as TaskStatus;
    }
    if (params.kind) {
      where.kind = params.kind as TaskKind;
    }
    if (params.from || params.to) {
      where.dueAt = {};
      if (params.from) where.dueAt.gte = new Date(params.from);
      if (params.to) where.dueAt.lte = new Date(params.to);
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createTask(ownerId: string, dto: {
    title: string;
    notes?: string;
    kind?: TaskKind;
    dueAt?: string;
    priority?: TaskPriority;
    reminderAt?: string;
  }) {
    if (!dto.title || dto.title.length > 200) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Title is required (max 200 chars)' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    if (dto.notes && dto.notes.length > 2000) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Notes maximum 2,000 chars' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return this.prisma.task.create({
      data: {
        ownerId,
        title: dto.title.trim(),
        notes: dto.notes?.trim() || null,
        kind: dto.kind || TaskKind.task,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        priority: dto.priority || TaskPriority.normal,
        reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : null,
        status: TaskStatus.open,
      },
    });
  }

  async updateTask(taskId: string, ownerId: string, updates: Partial<{
    title: string;
    notes: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueAt: string;
    reminderAt: string;
    kind: TaskKind;
  }>) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new HttpException({ code: 'NOT_FOUND', message: 'Task not found' }, HttpStatus.NOT_FOUND);
    if (task.ownerId !== ownerId) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Access denied' }, HttpStatus.FORBIDDEN);
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(updates.title !== undefined && { title: updates.title.trim() }),
        ...(updates.notes !== undefined && { notes: updates.notes ? updates.notes.trim() : null }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.priority !== undefined && { priority: updates.priority }),
        ...(updates.dueAt !== undefined && { dueAt: updates.dueAt ? new Date(updates.dueAt) : null }),
        ...(updates.reminderAt !== undefined && { reminderAt: updates.reminderAt ? new Date(updates.reminderAt) : null }),
        ...(updates.kind !== undefined && { kind: updates.kind }),
      },
    });
  }

  async deleteTask(taskId: string, ownerId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new HttpException({ code: 'NOT_FOUND', message: 'Task not found' }, HttpStatus.NOT_FOUND);
    if (task.ownerId !== ownerId) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Access denied' }, HttpStatus.FORBIDDEN);
    }

    await this.prisma.task.delete({ where: { id: taskId } });
    return { ok: true, message: 'Task deleted' };
  }
}
