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
import { LocalAuthGuard } from './auth/local-auth.guard.js';
import { AuthService } from './auth/auth.service.js';
import { PinoLogger } from 'nestjs-pino';
import { HttpExceptionFilter } from './http-exception.filter.js';
import type { CreateUserDto } from './auth/dtos/create-user.dto.js';
import { CreateUserBody } from './auth/dtos/create-user.dto.js';
import { AuthLoginBody } from './auth/dtos/validate.dto.js';
import { UserDto } from './auth/dtos/user-response.dto.js';

@ApiTags('auth')
@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private logger: PinoLogger,
  ) {}
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: AuthLoginBody })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req) {
    return req.user;
  }

  @ApiOperation({ summary: 'Log out the current session' })
  @ApiOkResponse({ description: 'Session closed' })
  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserBody })
  @ApiCreatedResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'Invalid payload or email in use' })
  @Post('auth/register')
  @UseFilters(HttpExceptionFilter)
  async register(@Body() req: CreateUserDto) {
    return await this.authService.insertUser(req);
  }
}
