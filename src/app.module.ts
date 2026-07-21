import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './rooms/rooms.module.js';
import { SongsModule } from './songs/songs.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    SongsModule,
    RoomsModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
