import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDto {
  @ApiPropertyOptional() id?: string;
  @ApiProperty() email!: string;
  @ApiPropertyOptional() name?: string;
}

export const userResponseSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().optional(),
});

export type UserResponseDto = z.infer<typeof userResponseSchema>;
