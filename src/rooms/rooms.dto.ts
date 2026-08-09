import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomBody {
  @ApiProperty() bandId!: string;
  @ApiProperty({ type: [String] }) setlist!: string[];
}

export class JoinRoomBody {
  @ApiProperty() code!: string;
}

export class RoomUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() name!: string;
}

export class RoomMemberDto {
  @ApiProperty() id!: string;
  @ApiProperty() roomId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() role!: string;
  @ApiProperty() joinedAt!: string;
  @ApiProperty({ type: RoomUserDto, required: false }) user?: RoomUserDto;
}

export class RoomDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() bandId!: string;
  @ApiProperty() leaderId!: string;
  @ApiProperty() setlist!: string;
  @ApiPropertyOptional() activeSongId?: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ type: [RoomMemberDto], required: false })
  members?: RoomMemberDto[];
}

export const CreateRoomDto = z.object({
  bandId: z.string(),
  setlist: z.array(z.string()),
});

export const JoinRoomDto = z.object({
  code: z.string(),
});

export type CreateRoomInput = z.infer<typeof CreateRoomDto>;
export type JoinRoomInput = z.infer<typeof JoinRoomDto>;
