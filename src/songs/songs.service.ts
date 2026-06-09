import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateSongInput, UpdateSongInput } from './songs.dto.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class SongsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(bandId: string, q?: string) {
    return this.prisma.song.findMany({
      where: {
        bandId,
        ...(q
          ? {
              OR: [{ title: { contains: q } }, { artist: { contains: q } }],
            }
          : {}),
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const song = await this.prisma.song.findUnique({ where: { id } });
    if (!song) throw new NotFoundException(`Song ${id} not found`);
    return song;
  }

  async create(bandId: string, dto: CreateSongInput) {
    return this.prisma.song.create({
      data: {
        ...dto,
        sections: JSON.stringify(dto.sections),
        bandId,
      },
    });
  }

  async update(id: string, dto: UpdateSongInput) {
    await this.findOne(id);
    const { sections, ...rest } = dto;
    return this.prisma.song.update({
      where: { id },
      data: {
        ...rest,
        ...(sections !== undefined
          ? { sections: JSON.stringify(sections) }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.song.delete({ where: { id } });
  }
}
