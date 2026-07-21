import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateSongInput,
  ForkSongInput,
  UpdateSongInput,
} from './songs.dto.js';
import { PrismaService } from '../prisma.service.js';
import { SpotifyService } from './spotify.service.js';

@Injectable()
export class SongsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spotify: SpotifyService,
  ) {}

  async searchSpotify(q: string) {
    return this.spotify.searchTracks(q);
  }

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

  // Global catalog search across every band, so a song's characteristics
  // (title/artist/key/bpm) can be discovered independent of who uploaded it.
  async discover(q?: string) {
    return this.prisma.song.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q } },
              { artist: { contains: q } },
              { key: { contains: q } },
            ],
          }
        : undefined,
      include: { band: { select: { id: true, name: true } } },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const song = await this.prisma.song.findUnique({
      where: { id },
      include: { band: { select: { id: true, name: true } } },
    });
    if (!song) throw new NotFoundException(`Song ${id} not found`);
    return song;
  }

  async create(bandId: string, dto: CreateSongInput) {
    return this.prisma.song.create({
      data: { ...dto, bandId },
    });
  }

  async update(id: string, dto: UpdateSongInput) {
    await this.findOne(id);
    return this.prisma.song.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.song.delete({ where: { id } });
  }

  // Clones a song (found via search or a shared identifier) into another
  // band's own repertoire, keeping a pointer back to where it came from.
  async fork(sourceId: string, bandId: string, overrides?: ForkSongInput) {
    const source = await this.findOne(sourceId);
    return this.prisma.song.create({
      data: {
        title: source.title,
        artist: source.artist,
        author: source.author,
        key: source.key,
        bpm: source.bpm,
        duration: source.duration,
        lyrics: source.lyrics,
        sections: source.sections,
        ...overrides,
        bandId,
        originId: source.id,
      },
    });
  }
}
