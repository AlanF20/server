import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
    private readonly jwt: JwtService,
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
    return userResponseSchema.parse(user);
  }

  async login(user: UserResponseDto) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken, user };
  }
}
