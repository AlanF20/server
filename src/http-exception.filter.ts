import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from './generated/prisma/client.js';

@Catch(HttpException, ZodError, Prisma.PrismaClientKnownRequestError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (exception instanceof ZodError) {
      return response.status(500).json({
        errors: exception.issues,
      });
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      let message = '';
      if (exception.code === 'P2002') {
        message = 'Ingrese un email diferente, ingresado ya en uso.';
      }
      return response.status(500).json({
        code: exception.code,
        message,
      });
    }
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
