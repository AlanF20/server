import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateRoomInput, JoinRoomInput } from './rooms.dto.js';
import { PrismaService } from '../prisma.service.js';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (n: number) =>
    Array.from(
      { length: n },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  return `${part(4)}-${part(4)}`;
}

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(leaderId: string, dto: CreateRoomInput) {
    const code = generateCode();
    return await this.prisma.room.create({
      data: {
        code,
        bandId: dto.bandId,
        leaderId,
        setlist: JSON.stringify(dto.setlist),
        activeSongId: dto.setlist[0] ?? null,
        members: {
          create: { userId: leaderId, role: 'LEADER' },
        },
      },
      include: { members: true },
    });
  }

  async join(userId: string, dto: JoinRoomInput) {
    const room = await this.prisma.room.findUnique({
      where: { code: dto.code },
    });
    if (!room) throw new NotFoundException(`Room ${dto.code} not found`);

    await this.prisma.roomMember.upsert({
      where: { roomId_userId: { roomId: room.id, userId } },
      create: { roomId: room.id, userId, role: 'MEMBER' },
      update: {},
    });

    return this.findByCode(dto.code);
  }

  async findByCode(code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: { members: { include: { user: true } } },
    });
    if (!room) throw new NotFoundException(`Room ${code} not found`);
    return room;
  }

  async close(code: string) {
    const room = await this.prisma.room.findUnique({ where: { code } });
    if (!room) throw new NotFoundException(`Room ${code} not found`);
    return this.prisma.room.delete({ where: { code } });
  }
}
