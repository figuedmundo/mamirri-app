import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Patient, TreatmentSession, Evaluation } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';

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
  voiceNotes?: any;
}

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

import { StorageService } from '../storage/storage.service';

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    therapistId: string,
  ): Promise<Patient> {
    const { birthDate, emergencyContact, ...rest } = createPatientDto;

    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      throw new BadRequestException('Invalid birth date');
    }

    const patient = await this.prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: {
          ...rest,
          emergencyContact: emergencyContact as any,
          birthDate: birthDateObj,
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
                  phases: [
                    {
                      number: 1,
                      name: 'Inicial',
                      durationWeeks: 3,
                      techniques: [
                        'Movilizaciones',
                        'Crioterapia',
                        'Masaje descontracturante',
                      ],
                      objectives:
                        'Alivio del dolor y reducción de contracturas',
                    },
                    {
                      number: 2,
                      name: 'Temprana Intermedia',
                      durationWeeks: 3,
                      techniques: [
                        'Estiramientos suaves',
                        'Movilidad articular',
                        'Termoterapia',
                      ],
                      objectives: 'Iniciar estiramientos y mejorar movilidad',
                    },
                    {
                      number: 3,
                      name: 'Intermedia',
                      durationWeeks: 3,
                      techniques: [
                        'Estiramientos progresivos',
                        'Fortalecimiento isométrico',
                        'Propiocepción',
                      ],
                      objectives: 'Ganancia de flexibilidad y estabilidad',
                    },
                    {
                      number: 4,
                      name: 'Tardía Intermedia',
                      durationWeeks: 3,
                      techniques: [
                        'Ejercicios terapéuticos',
                        'Fortalecimiento isotónico',
                        'Trabajo funcional',
                      ],
                      objectives:
                        'Fortalecimiento muscular y ejercicios terapéuticos',
                    },
                    {
                      number: 5,
                      name: 'Avanzada',
                      durationWeeks: 3,
                      techniques: [
                        'Fortalecimiento funcional',
                        'Ejercicios pliométricos',
                        'Retorno a actividades',
                      ],
                      objectives:
                        'Fortalecimiento funcional y preparación para alta',
                    },
                  ],
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

    return patient;
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
              treatmentSessions: {
                include: {
                  photos: true,
                },
              },
              evaluations: {
                include: {
                  footprints: true,
                  postureVideos: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // Hydrate media URLs
    const hydratedPatients = await Promise.all(
      patients.map((patient) => this.hydratePatientMedia(patient)),
    );

    return {
      data: hydratedPatients,
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
            evaluations: {
              include: {
                footprints: true,
                postureVideos: true,
              },
            },
            treatmentPlan: true,
            treatmentSessions: {
              include: {
                photos: true,
              },
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

    return this.hydratePatientMedia(patient);
  }

  private async hydratePatientMedia(patient: any): Promise<any> {
    if (!patient.clinicalCases) return patient;

    for (const clinicalCase of patient.clinicalCases) {
      // Hydrate Evaluations
      if (clinicalCase.evaluations) {
        for (const evaluation of clinicalCase.evaluations) {
          // Voice Notes
          if (
            evaluation.voiceNotes &&
            Array.isArray(evaluation.voiceNotes) &&
            evaluation.voiceNotes.length > 0
          ) {
            evaluation.voiceNotes = await Promise.all(
              evaluation.voiceNotes.map(async (note: any) => {
                if (note.createdAt && !note.date) {
                  note.date = note.createdAt;
                }
                if (note.audioUrl && !note.audioUrl.startsWith('http')) {
                  try {
                    note.audioUrl = await this.storageService.getFileUrl(
                      note.audioUrl,
                    );
                  } catch {
                    // Ignore signing errors
                  }
                }
                return note;
              }),
            );
          }

          // Footprints
          if (evaluation.footprints) {
            for (const footprint of evaluation.footprints) {
              if (footprint.url && !footprint.url.startsWith('http')) {
                try {
                  footprint.url = await this.storageService.getFileUrl(
                    footprint.url,
                  );
                } catch {
                  // Ignore signing errors
                }
              }
            }
          }

          // Posture Videos
          if (evaluation.postureVideos) {
            for (const video of evaluation.postureVideos) {
              if (video.url && !video.url.startsWith('http')) {
                try {
                  video.url = await this.storageService.getFileUrl(video.url);
                } catch {
                  // Ignore signing errors
                }
              }
            }
          }
        }
      }

      // Hydrate Sessions
      if (clinicalCase.treatmentSessions) {
        for (const session of clinicalCase.treatmentSessions) {
          // Voice Notes
          if (
            session.voiceNotes &&
            Array.isArray(session.voiceNotes) &&
            session.voiceNotes.length > 0
          ) {
            session.voiceNotes = await Promise.all(
              session.voiceNotes.map(async (note: any) => {
                if (note.createdAt && !note.date) {
                  note.date = note.createdAt;
                }
                if (note.audioUrl && !note.audioUrl.startsWith('http')) {
                  try {
                    note.audioUrl = await this.storageService.getFileUrl(
                      note.audioUrl,
                    );
                  } catch {
                    // Ignore signing errors
                  }
                }
                return note;
              }),
            );
          }

          // Session Photos
          if (session.photos) {
            for (const photo of session.photos) {
              // SessionPhoto uses storageKey, client expects url
              const key = photo.storageKey;
              if (key) {
                try {
                  photo.url = await this.storageService.getFileUrl(key);
                } catch {
                  photo.url = key;
                }
              }
            }
          }
        }
      }
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
      const birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj.getTime())) {
        throw new BadRequestException('Invalid birth date');
      }
      data.birthDate = birthDateObj;
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

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new BadRequestException('Invalid session date');
    }

    return this.prisma.treatmentSession.create({
      data: {
        ...rest,
        date: dateObj,
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

    const {
      posturogram,
      orthopedicTests,
      avdEvaluation,
      painScale,
      diagnosis,
      voiceNotes,
    } = updateDto;

    const data: any = {};
    if (posturogram !== undefined) data.posturogram = posturogram;
    if (orthopedicTests !== undefined) data.orthopedicTests = orthopedicTests;
    if (avdEvaluation !== undefined) data.avdEvaluation = avdEvaluation;
    if (painScale !== undefined) data.painScale = painScale;
    if (diagnosis !== undefined) data.diagnosis = diagnosis;
    if (voiceNotes !== undefined) data.voiceNotes = voiceNotes;

    return this.prisma.evaluation.update({
      where: { id: evaluationId },
      data,
    });
  }
}
