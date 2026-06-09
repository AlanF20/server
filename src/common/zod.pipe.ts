import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodType } from 'zod';
import { fromZodError } from 'zod-validation-error';

export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(fromZodError(result.error).message);
    }
    return result.data;
  }
}
