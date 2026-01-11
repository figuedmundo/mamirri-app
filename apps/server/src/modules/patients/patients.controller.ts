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
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from './decorators/current-therapist.decorator';
import { Patient } from '@prisma/client';

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
    type: PatientResponseDto,
  })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentTherapist() user: any,
  ): Promise<PatientResponseDto> {
    const patient = await this.patientsService.create(
      createPatientDto,
      user.userId,
    );
    return this.mapToResponseDto(patient);
  }

  @Get()
  @ApiOperation({ summary: 'List all patients' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of patients belonging to the therapist.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @CurrentTherapist() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    const result = await this.patientsService.findAll(
      user.userId,
      page,
      limit,
      search,
    );
    return {
      data: result.data.map((patient) => this.mapToResponseDto(patient)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The patient details.',
    type: PatientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found.',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentTherapist() user: any,
  ): Promise<PatientResponseDto> {
    const patient = await this.patientsService.findOne(id, user.userId);
    return this.mapToResponseDto(patient);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a patient' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The patient has been successfully updated.',
    type: PatientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentTherapist() user: any,
  ): Promise<PatientResponseDto> {
    const patient = await this.patientsService.update(
      id,
      user.userId,
      updatePatientDto,
    );
    return this.mapToResponseDto(patient);
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
  async remove(
    @Param('id') id: string,
    @CurrentTherapist() user: any,
  ): Promise<void> {
    await this.patientsService.remove(id, user.userId);
  }

  private mapToResponseDto(patient: Patient): PatientResponseDto {
    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dob: patient.dob,
      email: patient.email,
      phone: patient.phone,
      createdAt: patient.createdAt,
    };
  }
}
