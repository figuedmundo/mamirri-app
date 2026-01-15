import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TreatmentSession } from '@prisma/client';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createSessionDto: CreateSessionDto,
    therapistId: string,
  ): Promise<TreatmentSession> {
    const { clinicalCaseId, ...rest } = createSessionDto;

    const clinicalCase = await this.prisma.clinicalCase.findFirst({
      where: {
        id: clinicalCaseId,
        patient: {
          therapistId,
          deletedAt: null,
        },
      },
    });

    if (!clinicalCase) {
      throw new NotFoundException(`Clinical case not found or access denied`);
    }

    return this.prisma.treatmentSession.create({
      data: {
        ...rest,
        clinicalCaseId,
        therapistId,
        status: 'DRAFT',
      },
    });
  }

  async findAll(
    therapistId: string,
    page: number = 1,
    limit: number = 20,
    clinicalCaseId?: string,
  ): Promise<PaginatedResponseDto<TreatmentSession>> {
    const skip = (page - 1) * limit;
    const where: any = {
      therapistId,
      deletedAt: null,
    };

    if (clinicalCaseId) {
      where.clinicalCaseId = clinicalCaseId;
    }

    const [total, sessions] = await this.prisma.$transaction([
      this.prisma.treatmentSession.count({ where }),
      this.prisma.treatmentSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
    ]);

    return {
      data: sessions,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, therapistId: string): Promise<TreatmentSession> {
    const session = await this.prisma.treatmentSession.findFirst({
      where: {
        id,
        therapistId,
        deletedAt: null,
      },
      include: {
        clinicalCase: {
          include: {
            patient: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session not found`);
    }

    return session;
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
    therapistId: string,
  ): Promise<TreatmentSession> {
    const session = await this.findOne(id, therapistId);

    if (session.status === 'COMPLETED') {
      throw new BadRequestException('Cannot update a completed session');
    }

    return this.prisma.treatmentSession.update({
      where: { id },
      data: updateSessionDto,
    });
  }

  async finalize(id: string, therapistId: string): Promise<TreatmentSession> {
    const session = await this.findOne(id, therapistId);

    if (session.status === 'COMPLETED') {
      return session;
    }

    return this.prisma.treatmentSession.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  async remove(id: string, therapistId: string): Promise<void> {
    await this.findOne(id, therapistId);

    await this.prisma.treatmentSession.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
