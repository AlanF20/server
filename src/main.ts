import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
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

  const config = new DocumentBuilder()
    .setTitle('Repertory API')
    .setDescription('API for managing band song repertoires and live rooms')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.use(
    '/api/docs',
    apiReference({
      spec: { content: document },
      pageTitle: 'Repertory API',
    }),
  );

  await app.listen(PORT);
  console.log(`Server running on http://localhost:${PORT}`);
}
void bootstrap();
