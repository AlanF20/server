import { z } from 'zod';
import { authSchema } from './validate.dto.js';

export const CreateUserSchema = authSchema.extend({
  name: z.string(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
