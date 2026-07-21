import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateSongDto,
  type CreateSongInput,
  ForkSongDto,
  type ForkSongInput,
  UpdateSongDto,
  type UpdateSongInput,
} from './songs.dto.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { SongsService } from './songs.service.js';

@Controller('songs')
export class SongsController {
  constructor(private readonly songs: SongsService) {}

  @Get()
  findAll(@Query('bandId') bandId: string, @Query('q') q?: string) {
    return this.songs.findAll(bandId, q);
  }

  @Get('discover')
  discover(@Query('q') q?: string) {
    return this.songs.discover(q);
  }

  @Get('search-spotify')
  searchSpotify(@Query('q') q: string) {
    return this.songs.searchSpotify(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.songs.findOne(id);
  }

  @Post()
  create(
    @Query('bandId') bandId: string,
    @Body(new ZodPipe(CreateSongDto)) body: CreateSongInput,
  ) {
    return this.songs.create(bandId, body);
  }

  @Post(':id/fork')
  fork(
    @Param('id') id: string,
    @Query('bandId') bandId: string,
    @Body(new ZodPipe(ForkSongDto)) overrides: ForkSongInput,
  ) {
    return this.songs.fork(id, bandId, overrides);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodPipe(UpdateSongDto)) body: UpdateSongInput,
  ) {
    return this.songs.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.songs.remove(id);
  }
}
