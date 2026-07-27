import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { FRONT_URL, PORT } from './config/envs.js';
import { NativeLogger } from 'nestjs-pino';
import { HttpExceptionFilter } from './http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(NativeLogger));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: FRONT_URL, credentials: true });
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(PORT);
  console.log(`Server running on http://localhost:${PORT}`);
}
void bootstrap();
