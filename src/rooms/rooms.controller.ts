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
import { RoomsService } from './rooms.service.js';
import { CreateRoomDto, JoinRoomDto } from './rooms.dto.js';
import type { CreateRoomInput, JoinRoomInput } from './rooms.dto.js';
import { ZodPipe } from '../common/zod.pipe.js';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Post()
  create(@Body(new ZodPipe(CreateRoomDto)) body: CreateRoomInput) {
    // leaderId will come from JWT guard in Phase 2 — hardcoded placeholder for now
    return this.rooms.create('placeholder-leader-id', body);
  }

  @Post('join')
  join(@Body(new ZodPipe(JoinRoomDto)) body: JoinRoomInput) {
    return this.rooms.join('placeholder-user-id', body);
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.rooms.findByCode(code);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  close(@Param('code') code: string) {
    return this.rooms.close(code);
  }
}
