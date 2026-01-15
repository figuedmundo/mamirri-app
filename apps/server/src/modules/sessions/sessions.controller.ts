import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from '../patients/decorators/current-therapist.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { TreatmentSession } from '@prisma/client';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new treatment session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The session has been successfully created.',
  })
  create(
    @Body() createSessionDto: CreateSessionDto,
    @CurrentTherapist() user: any,
  ): Promise<TreatmentSession> {
    return this.sessionsService.create(createSessionDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List treatment sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of treatment sessions.',
  })
  findAll(
    @CurrentTherapist() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('clinicalCaseId') clinicalCaseId?: string,
  ): Promise<PaginatedResponseDto<TreatmentSession>> {
    return this.sessionsService.findAll(
      user.userId,
      page,
      limit,
      clinicalCaseId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a treatment session by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The session details.',
  })
  findOne(
    @Param('id') id: string,
    @CurrentTherapist() user: any,
  ): Promise<TreatmentSession> {
    return this.sessionsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a treatment session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The session has been successfully updated.',
  })
  update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
    @CurrentTherapist() user: any,
  ): Promise<TreatmentSession> {
    return this.sessionsService.update(id, updateSessionDto, user.userId);
  }

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Finalize a treatment session (mark as completed)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The session has been finalized.',
  })
  finalize(
    @Param('id') id: string,
    @CurrentTherapist() user: any,
  ): Promise<TreatmentSession> {
    return this.sessionsService.finalize(id, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a treatment session' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The session has been successfully deleted.',
  })
  remove(
    @Param('id') id: string,
    @CurrentTherapist() user: any,
  ): Promise<void> {
    return this.sessionsService.remove(id, user.userId);
  }
}
