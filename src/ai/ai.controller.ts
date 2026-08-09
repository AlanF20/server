import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { AiService } from './ai.service.js';
import { AiEnrichDto, AiEnrichBody } from './ai.dto.js';
import type { AiEnrichInput } from './ai.dto.js';
import { CreateSongBody } from '../songs/songs.dto.js';
import { ZodPipe } from '../common/zod.pipe.js';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('enrich')
  @ApiOperation({ summary: 'Enrich a song with key, bpm, author and lyrics' })
  @ApiBody({ type: AiEnrichBody })
  @ApiOkResponse({ type: CreateSongBody })
  enrich(@Body(new ZodPipe(AiEnrichDto)) body: AiEnrichInput) {
    return this.ai.enrichSong(body);
  }
}
