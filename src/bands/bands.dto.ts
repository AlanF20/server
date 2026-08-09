import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const CreateBandSchema = z.object({
  name: z.string().min(1),
});

export const UpdateBandSchema = z.object({
  name: z.string().min(1),
});

export const AddMemberSchema = z.object({
  email: z.string().email(),
});

export const TransferOwnershipSchema = z.object({
  userId: z.string(),
});

export const JoinBandSchema = z.object({
  code: z.string().min(1).max(32),
});

export type CreateBandInput = z.infer<typeof CreateBandSchema>;
export type UpdateBandInput = z.infer<typeof UpdateBandSchema>;
export type AddMemberInput = z.infer<typeof AddMemberSchema>;
export type TransferOwnershipInput = z.infer<typeof TransferOwnershipSchema>;
export type JoinBandInput = z.infer<typeof JoinBandSchema>;

export class CreateBandBody {
  @ApiProperty() name!: string;
}

export class UpdateBandBody {
  @ApiProperty() name!: string;
}

export class AddMemberBody {
  @ApiProperty() email!: string;
}

export class TransferOwnershipBody {
  @ApiProperty() userId!: string;
}

export class JoinBandBody {
  @ApiProperty() code!: string;
}

export class BandUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
}

export class BandMemberDto {
  @ApiProperty() id!: string;
  @ApiProperty() role!: string;
  @ApiProperty({ type: BandUserDto }) user!: BandUserDto;
}

export class BandDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() ownerId!: string;
  @ApiProperty() createdAt!: string;
  @ApiPropertyOptional({ required: false })
  inviteCode?: string;
  @ApiPropertyOptional({ type: [BandMemberDto], required: false })
  members?: BandMemberDto[];
}
