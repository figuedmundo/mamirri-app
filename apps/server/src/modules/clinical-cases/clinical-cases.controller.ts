import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClinicalCasesService } from './clinical-cases.service';
import { CreateClinicalCaseDto } from './dto/create-clinical-case.dto';
import { UpdateClinicalCaseDto } from './dto/update-clinical-case.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from '../patients/decorators/current-therapist.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { ClinicalCase } from '@prisma/client';

@ApiTags('clinical-cases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cases')
export class ClinicalCasesController {
  constructor(private readonly clinicalCasesService: ClinicalCasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new clinical case' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The clinical case has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found or access denied.',
  })
  async create(
    @Body() createClinicalCaseDto: CreateClinicalCaseDto,
    @CurrentTherapist() user: any,
  ): Promise<ClinicalCase> {
    return this.clinicalCasesService.create(createClinicalCaseDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List clinical cases' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of clinical cases belonging to therapist.',
  })
  async findAll(
    @CurrentTherapist() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResponseDto<ClinicalCase>> {
    return this.clinicalCasesService.findAll(
      user.userId,
      page,
      limit,
      patientId,
      status,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a clinical case by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'The clinical case details with evaluations and treatment sessions.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Clinical case not found or access denied.',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentTherapist() user: any,
  ): Promise<ClinicalCase> {
    return this.clinicalCasesService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a clinical case' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The clinical case has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Clinical case not found or access denied.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateClinicalCaseDto: UpdateClinicalCaseDto,
    @CurrentTherapist() user: any,
  ): Promise<ClinicalCase> {
    return this.clinicalCasesService.update(
      id,
      updateClinicalCaseDto,
      user.userId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a clinical case' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The clinical case has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Clinical case not found or access denied.',
  })
  async remove(
    @Param('id') id: string,
    @CurrentTherapist() user: any,
  ): Promise<void> {
    return this.clinicalCasesService.remove(id, user.userId);
  }
}
