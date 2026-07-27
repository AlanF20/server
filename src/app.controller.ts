import {
  Controller,
  Post,
  UseGuards,
  Body,
  UseFilters,
  Req,
  Request,
} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard.js';
import { AuthService } from './auth/auth.service.js';
import { PinoLogger } from 'nestjs-pino';
import { HttpExceptionFilter } from './http-exception.filter.js';
import type { CreateUserDto } from './auth/dtos/create-user.dto.js';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private logger: PinoLogger,
  ) {}
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req) {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @Post('auth/register')
  @UseFilters(HttpExceptionFilter)
  async register(@Body() req: CreateUserDto) {
    return await this.authService.insertUser(req);
  }
}
