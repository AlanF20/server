import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import bcrypt from 'bcrypt';
import { authSchema, ValidateAuthDto } from './dtos/validate.dto.js';
import {
  UserResponseDto,
  userResponseSchema,
} from './dtos/user-response.dto.js';
import { PinoLogger } from 'nestjs-pino';
import { CreateUserDto, CreateUserSchema } from './dtos/create-user.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async validateUser(input: ValidateAuthDto): Promise<UserResponseDto | null> {
    const { email, password } = authSchema.parse(input);
    this.logger.trace({ email, password }, 'aqui');
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

  async insertUser(input: CreateUserDto) {
    const parsedUser = CreateUserSchema.parse(input);
    const hashedPassword = await bcrypt.hash(parsedUser.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...parsedUser,
        password: hashedPassword,
      },
    });
    return user;
  }
}
