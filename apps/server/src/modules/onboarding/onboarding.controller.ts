import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { ClinicOnboardingDto } from './dto/clinic-onboarding.dto';
import { CheckNameQueryDto } from './dto/check-name-query.dto';
import {
  OnboardingResponse,
  CheckNameResponse,
} from './types/onboarding.types';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('clinic')
  @ApiOperation({
    summary: 'Create a new clinic with admin account',
    description:
      'Creates a clinic and the admin user (CLINIC_OWNER) in a single transaction. Returns user, clinic, and authentication tokens.',
  })
  @ApiResponse({
    status: 201,
    description: 'Clinic and admin account created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Clinic name or email already exists',
  })
  async createClinicWithAdmin(
    @Body() dto: ClinicOnboardingDto,
  ): Promise<OnboardingResponse> {
    return this.onboardingService.createClinicWithAdmin(dto);
  }

  @Get('check-name')
  @ApiOperation({
    summary: 'Check clinic name availability',
    description: 'Returns whether a clinic name is available for use.',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability check completed',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid name format',
  })
  async checkNameAvailability(
    @Query() query: CheckNameQueryDto,
  ): Promise<CheckNameResponse> {
    return this.onboardingService.checkNameAvailability(query.name);
  }
}
