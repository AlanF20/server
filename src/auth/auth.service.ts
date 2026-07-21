import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service.js';
import bcrypt from 'bcrypt';
import { authSchema } from './dtos/validate.dto.js';
import { userResponseSchema } from './dtos/user-response.dto.js';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(input): Promise<any> {
    const { email, password } = authSchema.parse(input);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return userResponseSchema.parse(user);
    }
    return null;
  }
}
