import { z } from 'zod';

const SegmentSchema = z.object({
  c: z.string().nullable(),
  t: z.string(),
});

const SectionSchema = z.object({
  label: z.string(),
  prog: z.array(z.string()),
  lines: z.array(z.array(SegmentSchema)),
});

export const SongSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  author: z.string().nullish(),
  key: z.string(),
  bpm: z.number().int(),
  duration: z.number(),
  sections: z.array(SectionSchema),
});

export const CreateSongDto = SongSchema.omit({ id: true });
export const UpdateSongDto = CreateSongDto.partial();

export type CreateSongInput = z.infer<typeof CreateSongDto>;
export type UpdateSongInput = z.infer<typeof UpdateSongDto>;
