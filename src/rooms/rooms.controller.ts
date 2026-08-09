import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service.js';
import {
  CreateRoomDto,
  JoinRoomDto,
  CreateRoomBody,
  JoinRoomBody,
  RoomDto,
} from './rooms.dto.js';
import type { CreateRoomInput, JoinRoomInput } from './rooms.dto.js';
import { ZodPipe } from '../common/zod.pipe.js';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a room for a band' })
  @ApiBody({ type: CreateRoomBody })
  @ApiCreatedResponse({ type: RoomDto })
  create(@Body(new ZodPipe(CreateRoomDto)) body: CreateRoomInput) {
    // leaderId will come from JWT guard in Phase 2 — hardcoded placeholder for now
    return this.rooms.create('placeholder-leader-id', body);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a room by code' })
  @ApiBody({ type: JoinRoomBody })
  @ApiOkResponse({ type: RoomDto })
  join(@Body(new ZodPipe(JoinRoomDto)) body: JoinRoomInput) {
    return this.rooms.join('placeholder-user-id', body);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Find a room by code' })
  @ApiParam({ name: 'code', type: String })
  @ApiOkResponse({ type: RoomDto })
  findByCode(@Param('code') code: string) {
    return this.rooms.findByCode(code);
  }

  @Delete(':code')
  @ApiOperation({ summary: 'Close a room' })
  @ApiParam({ name: 'code', type: String })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  close(@Param('code') code: string) {
    return this.rooms.close(code);
  }
}
