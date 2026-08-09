import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { authSchema } from './validate.dto.js';

export class CreateUserBody {
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiProperty() password!: string;
}

export const CreateUserSchema = authSchema.extend({
  name: z.string(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
