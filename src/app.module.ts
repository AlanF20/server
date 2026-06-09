import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module.js';
import { RoomsModule } from './rooms/rooms.module.js';
import { SongsModule } from './songs/songs.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    SongsModule,
    //RoomsModule,
    AiModule,
  ],
})
export class AppModule {}
