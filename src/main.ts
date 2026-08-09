import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module.js';
import { FRONT_URLS, PORT } from './config/envs.js';
import { NativeLogger } from 'nestjs-pino';
import { HttpExceptionFilter } from './http-exception.filter.js';

function isAllowedOrigin(origin: string): boolean {
  if (FRONT_URLS.includes(origin)) return true;
  // Dev-only: tolerate any localhost/127.0.0.1 port so the Vite dev server can
  // drift to another port without breaking CORS.
  if (process.env.NODE_ENV === 'production') return false;
  try {
    const url = new URL(origin);
    return (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(NativeLogger));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });
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
