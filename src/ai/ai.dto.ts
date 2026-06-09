import { z } from 'zod';

export const AiEnrichDto = z.object({
  title: z.string(),
  artist: z.string(),
});

export type AiEnrichInput = z.infer<typeof AiEnrichDto>;
