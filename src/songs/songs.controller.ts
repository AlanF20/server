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
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import {
  CreateSongDto,
  type CreateSongInput,
  ForkSongDto,
  type ForkSongInput,
  UpdateSongDto,
  type UpdateSongInput,
  SongDto,
  SongWithBandDto,
  SpotifyTrackDto,
  CreateSongBody,
  UpdateSongBody,
  ForkSongBody,
} from './songs.dto.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { SongsService } from './songs.service.js';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private readonly songs: SongsService) {}

  @Get()
  @ApiOperation({ summary: 'List songs of a band' })
  @ApiQuery({ name: 'bandId', required: true, type: String })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiOkResponse({ type: SongDto, isArray: true })
  findAll(@Query('bandId') bandId: string, @Query('q') q?: string) {
    return this.songs.findAll(bandId, q);
  }

  @Get('discover')
  @ApiOperation({ summary: 'Search the global song catalog' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiOkResponse({ type: SongWithBandDto, isArray: true })
  discover(@Query('q') q?: string) {
    return this.songs.discover(q);
  }

  @Get('search-spotify')
  @ApiOperation({ summary: 'Search songs on Spotify' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiOkResponse({ type: SpotifyTrackDto, isArray: true })
  searchSpotify(@Query('q') q: string) {
    return this.songs.searchSpotify(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a song by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: SongWithBandDto })
  findOne(@Param('id') id: string) {
    return this.songs.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a song' })
  @ApiQuery({ name: 'bandId', required: true, type: String })
  @ApiBody({ type: CreateSongBody })
  @ApiCreatedResponse({ type: SongDto })
  create(
    @Query('bandId') bandId: string,
    @Body(new ZodPipe(CreateSongDto)) body: CreateSongInput,
  ) {
    return this.songs.create(bandId, body);
  }

  @Post(':id/fork')
  @ApiOperation({ summary: 'Fork a song into a band' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'bandId', required: true, type: String })
  @ApiBody({ type: ForkSongBody })
  @ApiCreatedResponse({ type: SongDto })
  fork(
    @Param('id') id: string,
    @Query('bandId') bandId: string,
    @Body(new ZodPipe(ForkSongDto)) overrides: ForkSongInput,
  ) {
    return this.songs.fork(id, bandId, overrides);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a song' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSongBody })
  @ApiOkResponse({ type: SongDto })
  update(
    @Param('id') id: string,
    @Body(new ZodPipe(UpdateSongDto)) body: UpdateSongInput,
  ) {
    return this.songs.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a song' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.songs.remove(id);
  }
}
