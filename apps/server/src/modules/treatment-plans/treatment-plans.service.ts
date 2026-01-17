import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TreatmentPlan } from '@prisma/client';
import { UpdateObjectivesDto } from './dto/update-objectives.dto';

@Injectable()
export class TreatmentPlansService {
  constructor(private prisma: PrismaService) {}

  async updateObjectives(
    id: string,
    updateObjectivesDto: UpdateObjectivesDto,
    therapistId: string,
  ): Promise<TreatmentPlan> {
    const treatmentPlan = await this.findOneWithTherapistAccess(
      id,
      therapistId,
    );

    const currentObjectives =
      (treatmentPlan.objectives as Record<string, string>) || {};
    const updatedObjectives = {
      ...currentObjectives,
      ...(updateObjectivesDto.therapeutic !== undefined && {
        therapeutic: updateObjectivesDto.therapeutic,
      }),
      ...(updateObjectivesDto.prophylactic !== undefined && {
        prophylactic: updateObjectivesDto.prophylactic,
      }),
      ...(updateObjectivesDto.educational !== undefined && {
        educational: updateObjectivesDto.educational,
      }),
    };

    return this.prisma.treatmentPlan.update({
      where: { id },
      data: {
        objectives: updatedObjectives,
      },
    });
  }

  async findOne(id: string, therapistId: string): Promise<TreatmentPlan> {
    return this.findOneWithTherapistAccess(id, therapistId);
  }

  private async findOneWithTherapistAccess(
    id: string,
    therapistId: string,
  ): Promise<TreatmentPlan> {
    const treatmentPlan = await this.prisma.treatmentPlan.findFirst({
      where: {
        id,
        clinicalCase: {
          patient: {
            therapistId,
            deletedAt: null,
          },
        },
      },
    });

    if (!treatmentPlan) {
      throw new NotFoundException(`Treatment plan with ID ${id} not found`);
    }

    return treatmentPlan;
  }
}
