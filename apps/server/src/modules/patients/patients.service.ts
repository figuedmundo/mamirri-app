import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
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
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    therapistId: string,
    clinicId?: string | null,
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
          clinicId: clinicId ?? null,
          primaryTherapistId: therapistId,
          clinicalCases: {
            create: {
              clinicId: clinicId ?? null,
              title: 'Initial Case - General Evaluation',
              status: 'active',
              startDate: new Date(),
              consultationReason: 'Initial evaluation',
              evaluation: {
                create: {
                  clinicId: clinicId ?? null,
                  date: new Date(),
                  posturogram: {},
                  orthopedicTests: {},
                  avdEvaluation: {
                    barthel: {
                      feeding: 0,
                      bathing: 0,
                      grooming: 0,
                      dressing: 0,
                      bowels: 0,
                      bladder: 0,
                      toiletUse: 0,
                      transfers: 0,
                      mobility: 0,
                      stairs: 0,
                      total: 0,
                      interpretation: '',
                    },
                    lawton: {
                      phoneUse: 0,
                      shopping: 0,
                      foodPreparation: 0,
                      housekeeping: 0,
                      laundry: 0,
                      transportation: 0,
                      medication: 0,
                      finances: 0,
                      total: 0,
                      interpretation: '',
                    },
                  },
                  painScale: {
                    activity: 0,
                    rest: 0,
                    palpation: 0,
                    type: 'chronic',
                  },
                  diagnosis: {
                    functionalIndicator: '',
                    clinicalAspect: '',
                    anatomopathology: '',
                    avdConsequences: '',
                  },
                },
              },
            },
          },
        },
        include: {
          clinicalCases: {
            include: {
              evaluation: true,
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
    clinicId?: string | null,
  ): Promise<PaginatedResponseDto<Patient>> {
    const skip = (page - 1) * limit;
    const where: any = {
      therapistId,
      deletedAt: null,
      ...(clinicId ? { clinicId } : {}),
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
              evaluation: {
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

  async findOne(
    id: string,
    therapistId: string,
    clinicId?: string | null,
  ): Promise<Patient> {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        therapistId,
        deletedAt: null,
        ...(clinicId ? { clinicId } : {}),
      },
      include: {
        clinicalCases: {
          include: {
            evaluation: {
              include: {
                footprints: true,
                postureVideos: true,
              },
            },
            treatmentPlan: {
              include: {
                protocols: {
                  include: {
                    protocol: true,
                  },
                },
              },
            },
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
      if (clinicalCase.evaluation) {
        const evaluation = clinicalCase.evaluation;
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
                } catch (error) {
                  this.logger.warn(
                    `Failed to sign evaluation voice note id=${note.id ?? 'unknown'} key=${note.audioUrl}`,
                  );
                  this.logger.debug(error);
                }
              } else if (note.audioUrl && note.audioUrl.startsWith('http')) {
                try {
                  const normalizedKey = this.storageService.toStorageKey(
                    note.audioUrl,
                  );
                  note.audioUrl =
                    await this.storageService.getFileUrl(normalizedKey);
                } catch (error) {
                  this.logger.warn(
                    `Failed to normalize/sign evaluation voice note id=${note.id ?? 'unknown'} url=${note.audioUrl}`,
                  );
                  this.logger.debug(error);
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
                  } catch (error) {
                    this.logger.warn(
                      `Failed to sign session voice note id=${note.id ?? 'unknown'} key=${note.audioUrl}`,
                    );
                    this.logger.debug(error);
                  }
                } else if (note.audioUrl && note.audioUrl.startsWith('http')) {
                  try {
                    const normalizedKey = this.storageService.toStorageKey(
                      note.audioUrl,
                    );
                    note.audioUrl =
                      await this.storageService.getFileUrl(normalizedKey);
                  } catch (error) {
                    this.logger.warn(
                      `Failed to normalize/sign session voice note id=${note.id ?? 'unknown'} url=${note.audioUrl}`,
                    );
                    this.logger.debug(error);
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
    clinicId?: string | null,
  ): Promise<Patient> {
    await this.findOne(id, therapistId, clinicId);

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

  async remove(
    id: string,
    therapistId: string,
    clinicId?: string | null,
  ): Promise<void> {
    await this.findOne(id, therapistId, clinicId);

    await this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addSession(
    clinicalCaseId: string,
    createSessionDto: CreateTreatmentSessionDto,
    therapistId: string,
    clinicId?: string | null,
  ): Promise<TreatmentSession> {
    const clinicalCase = await this.prisma.clinicalCase.findFirst({
      where: {
        id: clinicalCaseId,
        patient: {
          therapistId,
          ...(clinicId ? { clinicId } : {}),
        },
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
        clinicId: clinicId ?? null,
      },
    });
  }

  async updateEvaluation(
    evaluationId: string,
    updateDto: UpdateEvaluationDto,
    therapistId: string,
    clinicId?: string | null,
  ): Promise<Evaluation> {
    const evaluation = await this.prisma.evaluation.findFirst({
      where: {
        id: evaluationId,
        clinicalCase: {
          patient: {
            therapistId,
            ...(clinicId ? { clinicId } : {}),
          },
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
