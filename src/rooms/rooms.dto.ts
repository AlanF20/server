import { z } from 'zod';

export const CreateRoomDto = z.object({
  bandId: z.string(),
  setlist: z.array(z.string()),
});

export const JoinRoomDto = z.object({
  code: z.string(),
});

export type CreateRoomInput = z.infer<typeof CreateRoomDto>;
export type JoinRoomInput = z.infer<typeof JoinRoomDto>;
