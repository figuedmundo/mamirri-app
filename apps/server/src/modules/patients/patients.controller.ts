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
import { PatientsService } from './patients.service';
import type {
  CreatePatientDto,
  CreateTreatmentSessionDto,
  UpdateEvaluationDto,
} from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from './decorators/current-therapist.decorator';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The patient has been successfully created.',
  })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentTherapist() user: any,
  ) {
    return this.patientsService.create(createPatientDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all patients' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of patients belonging to the therapist.',
  })
  async findAll(
    @CurrentTherapist() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.patientsService.findAll(user.userId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The patient details.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found.',
  })
  async findOne(@Param('id') id: string, @CurrentTherapist() user: any) {
    return this.patientsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a patient' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The patient has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: Partial<CreatePatientDto>,
    @CurrentTherapist() user: any,
  ) {
    return this.patientsService.update(id, updatePatientDto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a patient (soft delete)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The patient has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found.',
  })
  async remove(@Param('id') id: string, @CurrentTherapist() user: any) {
    return this.patientsService.remove(id, user.userId);
  }

  @Post('cases/:caseId/sessions')
  @ApiOperation({ summary: 'Add a treatment session to a clinical case' })
  async addSession(
    @Param('caseId') caseId: string,
    @Body() createSessionDto: CreateTreatmentSessionDto,
    @CurrentTherapist() user: any,
  ) {
    return this.patientsService.addSession(
      caseId,
      createSessionDto,
      user.userId,
    );
  }

  @Patch('evaluations/:id')
  @ApiOperation({ summary: 'Update a clinical evaluation' })
  async updateEvaluation(
    @Param('id') id: string,
    @Body() updateDto: UpdateEvaluationDto,
    @CurrentTherapist() user: any,
  ) {
    return this.patientsService.updateEvaluation(id, updateDto, user.userId);
  }
}
