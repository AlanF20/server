import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginBody {
  @ApiProperty() email!: string;
  @ApiProperty() password!: string;
}

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type ValidateAuthDto = z.infer<typeof authSchema>;
