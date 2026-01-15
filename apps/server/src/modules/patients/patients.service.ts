import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Patient,
  ClinicalCase,
  TreatmentSession,
  Evaluation,
} from '@prisma/client';

export interface CreatePatientDto {
  name: string;
  age: number;
  occupation: string;
  previousOccupation?: string;
  address?: string;
  gender?: string;
  phone: string;
  email?: string;
  birthDate: string;
}

export interface CreateTreatmentSessionDto {
  date: string;
  phaseNumber: number;
  procedures: string[];
  patientResponse: string;
  finalPainLevel: number;
  observations: string;
}

export interface UpdateEvaluationDto {
  posturogram?: any;
  orthopedicTests?: any;
  avdEvaluation?: any;
  painScale?: any;
  diagnosis?: any;
}

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPatientDto: CreatePatientDto,
    therapistId: string,
  ): Promise<Patient> {
    const { birthDate, ...rest } = createPatientDto;

    return this.prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: {
          ...rest,
          birthDate: new Date(birthDate),
          therapistId,
          clinicalCases: {
            create: {
              title: 'Initial Case - General Evaluation',
              status: 'active',
              startDate: new Date(),
              consultationReason: 'Initial evaluation',
              evaluations: {
                create: {
                  date: new Date(),
                  type: 'INITIAL',
                  posturogram: {},
                  orthopedicTests: {},
                  avdEvaluation: {},
                  painScale: {},
                  diagnosis: {},
                },
              },
              treatmentPlan: {
                create: {
                  objectives: {},
                  phases: [],
                },
              },
            },
          },
        },
        include: {
          clinicalCases: {
            include: {
              evaluations: true,
              treatmentPlan: true,
            },
          },
        },
      });

      return patient;
    });
  }

  async findAll(
    therapistId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<PaginatedResponseDto<Patient>> {
    const skip = (page - 1) * limit;
    const where: any = {
      therapistId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, patients] = await this.prisma.$transaction([
      this.prisma.patient.count({ where }),
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          clinicalCases: {
            include: {
              treatmentSessions: true,
              evaluations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      data: patients,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, therapistId: string): Promise<Patient> {
    const patient = await this.prisma.patient.findFirst({
      where: { id, therapistId, deletedAt: null },
      include: {
        clinicalCases: {
          include: {
            evaluations: true,
            treatmentPlan: true,
            treatmentSessions: {
              orderBy: { date: 'desc' },
            },
            insoles: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(
    id: string,
    updatePatientDto: Partial<CreatePatientDto>,
    therapistId: string,
  ): Promise<Patient> {
    await this.findOne(id, therapistId);

    const { birthDate, ...rest } = updatePatientDto;
    const data: any = { ...rest };
    if (birthDate) {
      data.birthDate = new Date(birthDate);
    }

    return this.prisma.patient.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, therapistId: string): Promise<void> {
    await this.findOne(id, therapistId);

    await this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addSession(
    clinicalCaseId: string,
    createSessionDto: CreateTreatmentSessionDto,
    therapistId: string,
  ): Promise<TreatmentSession> {
    const clinicalCase = await this.prisma.clinicalCase.findFirst({
      where: {
        id: clinicalCaseId,
        patient: { therapistId },
      },
    });

    if (!clinicalCase) {
      throw new BadRequestException('Clinical case not found or access denied');
    }

    const { date, ...rest } = createSessionDto;

    return this.prisma.treatmentSession.create({
      data: {
        ...rest,
        date: new Date(date),
        clinicalCaseId,
        therapistId,
      },
    });
  }

  async updateEvaluation(
    evaluationId: string,
    updateDto: UpdateEvaluationDto,
    therapistId: string,
  ): Promise<Evaluation> {
    const evaluation = await this.prisma.evaluation.findFirst({
      where: {
        id: evaluationId,
        clinicalCase: {
          patient: { therapistId },
        },
      },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found or access denied');
    }

    return this.prisma.evaluation.update({
      where: { id: evaluationId },
      data: updateDto,
    });
  }
}
