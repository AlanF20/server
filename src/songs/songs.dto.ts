import { z } from 'zod';

export const SongSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  author: z.string().nullish(),
  key: z.string().nullish(),
  bpm: z.number().int().nullish(),
  duration: z.number(),
  lyrics: z.string().nullish(),
  originId: z.string().nullish(),
});

export const CreateSongDto = SongSchema.omit({ id: true, originId: true });
export const UpdateSongDto = CreateSongDto.partial();
export const ForkSongDto = CreateSongDto.partial();

export type CreateSongInput = z.infer<typeof CreateSongDto>;
export type UpdateSongInput = z.infer<typeof UpdateSongDto>;
export type ForkSongInput = z.infer<typeof ForkSongDto>;
