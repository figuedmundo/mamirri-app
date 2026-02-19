import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TreatmentPlansService } from './treatment-plans.service';
import { UpdateObjectivesDto } from './dto/update-objectives.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from '../patients/decorators/current-therapist.decorator';
import { TreatmentPlan } from '@prisma/client';

@ApiTags('treatment-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('treatment-plans')
export class TreatmentPlansController {
  constructor(private readonly treatmentPlansService: TreatmentPlansService) {}

  @Patch(':id/objectives')
  @ApiOperation({ summary: 'Update treatment plan objectives' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The treatment plan objectives have been updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Treatment plan not found or access denied.',
  })
  async updateObjectives(
    @Param('id') id: string,
    @Body() updateObjectivesDto: UpdateObjectivesDto,
    @CurrentTherapist() user: { userId: string; clinicId?: string | null },
  ): Promise<TreatmentPlan> {
    return this.treatmentPlansService.updateObjectives(
      id,
      updateObjectivesDto,
      user.userId,
      user.clinicId,
    );
  }
}
