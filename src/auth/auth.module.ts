import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PrismaService } from 'src/prisma.service.js';

@Module({
  providers: [AuthService],
  imports: [PrismaService],
})
export class AuthModule {}
