import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BandsService } from './bands.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthUser } from '../common/current-user.decorator.js';
import { ZodPipe } from '../common/zod.pipe.js';
import {
  CreateBandSchema,
  UpdateBandSchema,
  AddMemberSchema,
  TransferOwnershipSchema,
  JoinBandSchema,
  type CreateBandInput,
  type UpdateBandInput,
  type AddMemberInput,
  type TransferOwnershipInput,
  type JoinBandInput,
  CreateBandBody,
  UpdateBandBody,
  AddMemberBody,
  TransferOwnershipBody,
  JoinBandBody,
  BandDto,
} from './bands.dto.js';

@ApiTags('bands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bands')
export class BandsController {
  constructor(private readonly bands: BandsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a band (creator becomes owner and member)' })
  @ApiBody({ type: CreateBandBody })
  @ApiCreatedResponse({ type: BandDto })
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodPipe(CreateBandSchema)) body: CreateBandInput,
  ) {
    return this.bands.create(user.id, body);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a band using an invite code' })
  @ApiBody({ type: JoinBandBody })
  @ApiOkResponse({ type: BandDto })
  join(
    @CurrentUser() user: AuthUser,
    @Body(new ZodPipe(JoinBandSchema)) body: JoinBandInput,
  ) {
    return this.bands.join(user.id, body.code);
  }

  @Get()
  @ApiOperation({ summary: 'List the bands the current user belongs to' })
  @ApiOkResponse({ type: BandDto, isArray: true })
  findAll(@CurrentUser() user: AuthUser) {
    return this.bands.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a band by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: BandDto })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.bands.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a band (owner only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateBandBody })
  @ApiOkResponse({ type: BandDto })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodPipe(UpdateBandSchema)) body: UpdateBandInput,
  ) {
    return this.bands.update(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a band and its songs/rooms (owner only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.bands.remove(user.id, id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a band by email (owner only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AddMemberBody })
  @ApiCreatedResponse({ type: BandDto })
  addMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodPipe(AddMemberSchema)) body: AddMemberInput,
  ) {
    return this.bands.addMember(user.id, id, body);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from a band (owner only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'userId', type: String })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.bands.removeMember(user.id, id, userId);
  }

  @Patch(':id/owner')
  @ApiOperation({ summary: 'Transfer band ownership to a member (owner only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: TransferOwnershipBody })
  @ApiOkResponse({ type: BandDto })
  transferOwnership(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodPipe(TransferOwnershipSchema)) body: TransferOwnershipInput,
  ) {
    return this.bands.transferOwnership(user.id, id, body);
  }
}
