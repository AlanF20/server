import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service.js';
import { UserResponseDto } from './dtos/user-response.dto.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, pass: string): Promise<UserResponseDto> {
    const user = await this.authService.validateUser({
      email: email,
      password: pass,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
