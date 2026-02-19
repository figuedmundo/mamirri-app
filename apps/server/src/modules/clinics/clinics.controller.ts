import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClinicRolesGuard } from '../../common/guards/clinic-roles.guard';
import { ROLES } from '../../common/constants/roles';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { InviteTherapistDto } from './dto/invite-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';

@ApiTags('clinics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ClinicRolesGuard)
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Create a clinic (admin only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Clinic created' })
  createClinic(@Body() dto: CreateClinicDto) {
    return this.clinicsService.createClinic(dto);
  }

  @Get('/admin/all')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'List all clinics (admin only)' })
  listClinics() {
    return this.clinicsService.listClinics();
  }

  @Get(':clinicId')
  @Roles(ROLES.CLINIC_OWNER, ROLES.ADMIN)
  @ApiOperation({ summary: 'Get clinic details' })
  getClinic(@Param('clinicId') clinicId: string, @CurrentUser() user: any) {
    return this.clinicsService.getClinicById(clinicId, user);
  }

  @Patch(':clinicId')
  @Roles(ROLES.CLINIC_OWNER, ROLES.ADMIN)
  @ApiOperation({ summary: 'Update clinic details' })
  updateClinic(
    @Param('clinicId') clinicId: string,
    @Body() dto: UpdateClinicDto,
    @CurrentUser() user: any,
  ) {
    return this.clinicsService.updateClinic(clinicId, dto, user);
  }

  @Post(':clinicId/invite')
  @Roles(ROLES.CLINIC_OWNER, ROLES.ADMIN)
  @ApiOperation({ summary: 'Invite therapist to clinic' })
  inviteTherapist(
    @Param('clinicId') clinicId: string,
    @Body() dto: InviteTherapistDto,
    @CurrentUser() user: any,
  ) {
    return this.clinicsService.inviteTherapist(clinicId, dto, user);
  }

  @Get(':clinicId/therapists')
  @Roles(ROLES.CLINIC_OWNER, ROLES.ADMIN)
  @ApiOperation({ summary: 'List clinic therapists' })
  listTherapists(
    @Param('clinicId') clinicId: string,
    @CurrentUser() user: any,
  ) {
    return this.clinicsService.listTherapists(clinicId, user);
  }

  @Patch(':clinicId/therapists/:userId')
  @Roles(ROLES.CLINIC_OWNER, ROLES.ADMIN)
  @ApiOperation({ summary: 'Update therapist role/status in clinic' })
  updateTherapist(
    @Param('clinicId') clinicId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateTherapistDto,
    @CurrentUser() user: any,
  ) {
    return this.clinicsService.updateTherapist(clinicId, userId, dto, user);
  }

  @Delete(':clinicId/therapists/:userId')
  @Roles(ROLES.CLINIC_OWNER, ROLES.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove therapist from clinic' })
  async removeTherapist(
    @Param('clinicId') clinicId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    await this.clinicsService.removeTherapist(clinicId, userId, user);
  }
}
