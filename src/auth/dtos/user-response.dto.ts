import { z } from 'zod';

export const userResponseSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().optional(),
});

export type UserResponseDto = z.infer<typeof userResponseSchema>;
