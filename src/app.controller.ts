import {
  Controller,
  Post,
  UseGuards,
  Body,
  UseFilters,
  Req,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { LocalAuthGuard } from './auth/local-auth.guard.js';
import { AuthService } from './auth/auth.service.js';
import { PinoLogger } from 'nestjs-pino';
import { HttpExceptionFilter } from './http-exception.filter.js';
import type { CreateUserDto } from './auth/dtos/create-user.dto.js';
import { CreateUserBody } from './auth/dtos/create-user.dto.js';
import { AuthLoginBody } from './auth/dtos/validate.dto.js';
import { UserDto } from './auth/dtos/user-response.dto.js';

interface RequestWithUser extends ExpressRequest {
  user: UserDto;
  logout: () => void;
}

@ApiTags('auth')
@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private logger: PinoLogger,
  ) {}
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: AuthLoginBody })
  @ApiOkResponse({ description: 'Returns a JWT access token and the user' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Log out the current session' })
  @ApiOkResponse({ description: 'Session closed' })
  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req: RequestWithUser) {
    return req.logout();
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserBody })
  @ApiCreatedResponse({
    description: 'Returns a JWT access token and the user',
  })
  @ApiBadRequestResponse({ description: 'Invalid payload or email in use' })
  @Post('auth/register')
  @UseFilters(HttpExceptionFilter)
  async register(@Body() req: CreateUserDto) {
    const user = await this.authService.insertUser(req);
    return this.authService.login(user);
  }
}
