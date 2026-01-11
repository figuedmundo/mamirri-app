import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto, therapistId: string) {
    return this.prisma.patient.create({
      data: {
        ...createPatientDto,
        dob: new Date(createPatientDto.dob),
        therapistId,
      },
    });
  }

  async findAll(
    therapistId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {
      therapistId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, therapistId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        therapistId,
        deletedAt: null,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(
    id: string,
    therapistId: string,
    updatePatientDto: UpdatePatientDto,
  ) {
    await this.findOne(id, therapistId);

    const data: Prisma.PatientUpdateInput = {
      ...updatePatientDto,
    };

    if (updatePatientDto.dob) {
      data.dob = new Date(updatePatientDto.dob);
    }

    return this.prisma.patient.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, therapistId: string) {
    await this.findOne(id, therapistId);

    await this.prisma.patient.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
