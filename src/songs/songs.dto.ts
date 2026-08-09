import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class SongDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() artist!: string;
  @ApiPropertyOptional() author?: string | null;
  @ApiPropertyOptional() key?: string | null;
  @ApiPropertyOptional() bpm?: number | null;
  @ApiProperty() duration!: number;
  @ApiPropertyOptional() lyrics?: string | null;
  @ApiPropertyOptional() originId?: string | null;
}

export class BandBriefDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class SongWithBandDto extends SongDto {
  @ApiProperty({ type: BandBriefDto }) band!: BandBriefDto;
}

export class SpotifyTrackDto {
  @ApiProperty() spotifyId!: string;
  @ApiProperty() title!: string;
  @ApiProperty() artist!: string;
  @ApiProperty() album!: string;
  @ApiPropertyOptional() albumArt?: string | null;
  @ApiProperty() duration!: number;
}

export class CreateSongBody {
  @ApiProperty() title!: string;
  @ApiProperty() artist!: string;
  @ApiPropertyOptional() author?: string | null;
  @ApiPropertyOptional() key?: string | null;
  @ApiPropertyOptional() bpm?: number | null;
  @ApiProperty() duration!: number;
  @ApiPropertyOptional() lyrics?: string | null;
}

export class UpdateSongBody extends PartialType(CreateSongBody) {}
export class ForkSongBody extends PartialType(CreateSongBody) {}

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
