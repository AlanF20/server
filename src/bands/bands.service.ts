import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma.service.js';
import type {
  CreateBandInput,
  UpdateBandInput,
  AddMemberInput,
  TransferOwnershipInput,
} from './bands.dto.js';

const INVITE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateInviteCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += INVITE_ALPHABET[bytes[i] % INVITE_ALPHABET.length];
  }
  return code;
}

@Injectable()
export class BandsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly bandInclude = {
    members: {
      include: { user: { select: { id: true, name: true, email: true } } },
    },
  } as const;

  private async isMember(userId: string, bandId: string): Promise<boolean> {
    const membership = await this.prisma.bandMember.findUnique({
      where: { bandId_userId: { bandId, userId } },
    });
    return membership !== null;
  }

  private async assertMember(userId: string, bandId: string): Promise<void> {
    if (!(await this.isMember(userId, bandId))) {
      throw new NotFoundException(`Band ${bandId} not found`);
    }
  }

  private async assertOwner(userId: string, bandId: string): Promise<void> {
    const band = await this.prisma.band.findUnique({
      where: { id: bandId },
    });
    if (!band) throw new NotFoundException(`Band ${bandId} not found`);
    if (band.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the band owner can perform this action',
      );
    }
  }

  async create(ownerId: string, dto: CreateBandInput) {
    return this.prisma.band.create({
      data: {
        name: dto.name,
        ownerId,
        inviteCode: generateInviteCode(),
        members: {
          create: { userId: ownerId, role: 'OWNER' },
        },
      },
      include: this.bandInclude,
    });
  }

  async join(userId: string, code: string) {
    const inviteCode = code.trim().toUpperCase();
    const band = await this.prisma.band.findUnique({ where: { inviteCode } });
    if (!band) throw new NotFoundException('Invalid invite code');
    await this.prisma.bandMember.upsert({
      where: { bandId_userId: { bandId: band.id, userId } },
      create: { bandId: band.id, userId, role: 'MEMBER' },
      update: {},
    });
    return this.findOne(userId, band.id);
  }

  async findAll(userId: string) {
    return this.prisma.band.findMany({
      where: { members: { some: { userId } } },
      include: this.bandInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, bandId: string) {
    await this.assertMember(userId, bandId);
    return this.prisma.band.findUnique({
      where: { id: bandId },
      include: this.bandInclude,
    });
  }

  async update(userId: string, bandId: string, dto: UpdateBandInput) {
    await this.assertOwner(userId, bandId);
    return this.prisma.band.update({
      where: { id: bandId },
      data: { name: dto.name },
      include: this.bandInclude,
    });
  }

  async remove(userId: string, bandId: string) {
    await this.assertOwner(userId, bandId);
    return this.prisma.band.delete({ where: { id: bandId } });
  }

  async addMember(ownerId: string, bandId: string, dto: AddMemberInput) {
    await this.assertOwner(ownerId, bandId);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException(`User ${dto.email} not found`);
    await this.prisma.bandMember.upsert({
      where: { bandId_userId: { bandId, userId: user.id } },
      create: { bandId, userId: user.id, role: 'MEMBER' },
      update: {},
    });
    return this.findOne(ownerId, bandId);
  }

  async removeMember(ownerId: string, bandId: string, userId: string) {
    await this.assertOwner(ownerId, bandId);
    if (userId === ownerId) {
      throw new BadRequestException(
        'The owner cannot be removed; transfer ownership first',
      );
    }
    const membership = await this.prisma.bandMember.findUnique({
      where: { bandId_userId: { bandId, userId } },
    });
    if (!membership)
      throw new NotFoundException(`Member ${userId} not found in band`);
    await this.prisma.bandMember.delete({
      where: { bandId_userId: { bandId, userId } },
    });
  }

  async transferOwnership(
    currentOwnerId: string,
    bandId: string,
    dto: TransferOwnershipInput,
  ) {
    await this.assertOwner(currentOwnerId, bandId);
    if (dto.userId === currentOwnerId) {
      throw new BadRequestException('The user already owns this band');
    }
    const targetMembership = await this.prisma.bandMember.findUnique({
      where: { bandId_userId: { bandId, userId: dto.userId } },
    });
    if (!targetMembership) {
      throw new BadRequestException(
        'The new owner must be a member of the band',
      );
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.band.update({
        where: { id: bandId },
        data: { ownerId: dto.userId },
      });
      await tx.bandMember.update({
        where: { bandId_userId: { bandId, userId: currentOwnerId } },
        data: { role: 'MEMBER' },
      });
      await tx.bandMember.update({
        where: { bandId_userId: { bandId, userId: dto.userId } },
        data: { role: 'OWNER' },
      });
      return tx.band.findUnique({
        where: { id: bandId },
        include: this.bandInclude,
      });
    });
  }
}
