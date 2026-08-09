import { Module } from '@nestjs/common';
import { BandsController } from './bands.controller.js';
import { BandsService } from './bands.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [BandsController],
  providers: [BandsService, PrismaService],
})
export class BandsModule {}
