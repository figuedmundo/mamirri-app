import {
  Delete,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { SearchLibraryDto } from './dto/search-library.dto';
import { AddProtocolToPlanDto } from './dto/add-protocol-to-plan.dto';
import { CreateProtocolDto } from './dto/create-protocol.dto';
import { UpdateProtocolDto } from './dto/update-protocol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from '../patients/decorators/current-therapist.decorator';

@ApiTags('library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List all clinical categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of categories.' })
  async findAllCategories() {
    return this.libraryService.findAllCategories();
  }

  @Get('protocols')
  @ApiOperation({ summary: 'List or search protocols' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of protocols.' })
  async findProtocols(@Query() dto: SearchLibraryDto) {
    const includeDeleted = dto.includeDeleted === true;
    if (dto.q) {
      return this.libraryService.search(dto.q, dto.categoryId, includeDeleted);
    }
    return this.libraryService.findAllProtocols(dto.categoryId, includeDeleted);
  }

  @Get('protocols/:id')
  @ApiOperation({ summary: 'Get protocol details with references' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Protocol details.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Protocol not found.',
  })
  async findOneProtocol(@Param('id') id: string) {
    return this.libraryService.findOneProtocol(id);
  }

  @Post('protocols')
  @ApiOperation({ summary: 'Create protocol' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Protocol created successfully.',
  })
  async createProtocol(@Body() dto: CreateProtocolDto) {
    return this.libraryService.createProtocol(dto);
  }

  @Patch('protocols/:id')
  @ApiOperation({ summary: 'Update protocol' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Protocol updated.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Protocol not found.',
  })
  async updateProtocol(
    @Param('id') id: string,
    @Body() dto: UpdateProtocolDto,
  ) {
    return this.libraryService.updateProtocol(id, dto);
  }

  @Delete('protocols/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive protocol' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Protocol archived.',
  })
  async archiveProtocol(@Param('id') id: string): Promise<void> {
    await this.libraryService.archiveProtocol(id);
  }

  @Post('protocols/:id/restore')
  @ApiOperation({ summary: 'Restore archived protocol' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Protocol restored successfully.',
  })
  async restoreProtocol(@Param('id') id: string) {
    return this.libraryService.restoreProtocol(id);
  }

  @Get('references')
  @ApiOperation({ summary: 'List all bibliographic references' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of references.' })
  async findAllReferences() {
    return this.libraryService.findAllReferences();
  }

  @Post('treatment-plans/:planId/protocols')
  @ApiOperation({ summary: 'Add a protocol to a treatment plan' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Protocol added to treatment plan.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Treatment plan or protocol not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Protocol already added to this treatment plan.',
  })
  async addProtocolToPlan(
    @Param('planId') planId: string,
    @Body() dto: AddProtocolToPlanDto,
    @CurrentTherapist() user: { userId: string },
  ) {
    return this.libraryService.addProtocolToPlan(
      planId,
      dto.protocolId,
      user.userId,
      dto.notes,
    );
  }
}
