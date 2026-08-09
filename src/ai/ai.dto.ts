import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export class AiEnrichBody {
  @ApiProperty() title!: string;
  @ApiProperty() artist!: string;
}

export const AiEnrichDto = z.object({
  title: z.string(),
  artist: z.string(),
});

export type AiEnrichInput = z.infer<typeof AiEnrichDto>;
