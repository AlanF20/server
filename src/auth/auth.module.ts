import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  providers: [AuthService, LocalStrategy, PrismaService],
  imports: [PassportModule],
})
export class AuthModule {}
