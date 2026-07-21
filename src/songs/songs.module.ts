import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller.js';
import { SongsService } from './songs.service.js';
import { SpotifyService } from './spotify.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [SongsController],
  providers: [SongsService, SpotifyService, PrismaService],
  exports: [SongsService],
})
export class SongsModule {}
