import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { FRONT_URL, PORT } from './config/envs.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: FRONT_URL, credentials: true });
  await app.listen(PORT);
  console.log(`Server running on http://localhost:${PORT}`);
}
void bootstrap();
