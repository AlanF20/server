import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { AiEnrichDto } from './ai.dto.js';
import type { AiEnrichInput } from './ai.dto.js';
import { ZodPipe } from '../common/zod.pipe.js';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('enrich')
  enrich(@Body(new ZodPipe(AiEnrichDto)) body: AiEnrichInput) {
    return this.ai.enrichSong(body);
  }
}
