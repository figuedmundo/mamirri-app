import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClinicalCase } from '@prisma/client';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { CreateClinicalCaseDto } from './dto/create-clinical-case.dto';
import { UpdateClinicalCaseDto } from './dto/update-clinical-case.dto';

@Injectable()
export class ClinicalCasesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createClinicalCaseDto: CreateClinicalCaseDto,
    therapistId: string,
    clinicId?: string | null,
  ): Promise<ClinicalCase> {
    const { patientId, ...rest } = createClinicalCaseDto;

    const patient = await this.prisma.patient.findFirst({
      where: {
        id: patientId,
        therapistId,
        deletedAt: null,
        ...(clinicId ? { clinicId } : {}),
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    return this.prisma.$transaction((tx) => {
      return tx.clinicalCase.create({
        data: {
          ...rest,
          clinicId: clinicId ?? null,
          patientId,
          startDate: new Date(),
          status: 'active',
          consultationReason: rest.consultationReason || '',
        },
      });
    });
  }

  async findAll(
    therapistId: string,
    page: number = 1,
    limit: number = 20,
    patientId?: string,
    status?: string,
    search?: string,
    clinicId?: string | null,
  ): Promise<PaginatedResponseDto<ClinicalCase>> {
    const skip = (page - 1) * limit;
    const where: any = {
      patient: {
        therapistId,
        deletedAt: null,
        ...(clinicId ? { clinicId } : {}),
      },
    };

    if (patientId) {
      where.patientId = patientId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { consultationReason: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, cases] = await this.prisma.$transaction([
      this.prisma.clinicalCase.count({ where }),
      this.prisma.clinicalCase.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      data: cases,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
    therapistId: string,
    clinicId?: string | null,
  ): Promise<ClinicalCase> {
    const clinicalCase = await this.prisma.clinicalCase.findFirst({
      where: {
        id,
        patient: {
          therapistId,
          deletedAt: null,
          ...(clinicId ? { clinicId } : {}),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        evaluation: true,
        treatmentSessions: true,
        treatmentPlan: true,
      },
    });

    if (!clinicalCase) {
      throw new NotFoundException(`Clinical case with ID ${id} not found`);
    }

    return clinicalCase;
  }

  async update(
    id: string,
    updateClinicalCaseDto: UpdateClinicalCaseDto,
    therapistId: string,
    clinicId?: string | null,
  ): Promise<ClinicalCase> {
    await this.findOne(id, therapistId, clinicId);

    return this.prisma.clinicalCase.update({
      where: { id },
      data: updateClinicalCaseDto,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(
    id: string,
    therapistId: string,
    clinicId?: string | null,
  ): Promise<void> {
    await this.findOne(id, therapistId, clinicId);

    await this.prisma.clinicalCase.delete({
      where: { id },
    });
  }
}
