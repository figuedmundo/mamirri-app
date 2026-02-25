import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { ROLES } from '../../common/constants/roles';
import { ClinicOnboardingDto } from './dto/clinic-onboarding.dto';
import {
  OnboardingResponse,
  CheckNameResponse,
} from './types/onboarding.types';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createClinicWithAdmin(
    dto: ClinicOnboardingDto,
  ): Promise<OnboardingResponse> {
    const normalizedClinicName = dto.clinicName.trim();
    const normalizedClinicEmail = dto.clinicEmail.toLowerCase().trim();
    const normalizedAdminEmail = dto.adminEmail.toLowerCase().trim();

    const existingClinic = await this.prisma.clinic.findFirst({
      where: {
        name: {
          equals: normalizedClinicName,
          mode: 'insensitive',
        },
      },
    });

    if (existingClinic) {
      throw new ConflictException('A clinic with this name already exists');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedAdminEmail },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: normalizedClinicName,
          email: normalizedClinicEmail,
          phone: dto.clinicPhone?.trim() || null,
          address: dto.clinicAddress?.trim() || null,
          isActive: true,
        },
      });

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(dto.adminPassword, salt);

      const user = await tx.user.create({
        data: {
          email: normalizedAdminEmail,
          passwordHash,
          name: dto.adminName.trim(),
          role: ROLES.CLINIC_OWNER,
          clinicId: clinic.id,
          clinicName: clinic.name,
          licenseNumber: dto.adminLicenseNumber?.trim() || null,
        },
      });

      return { clinic, user };
    });

    const tokens = this.authService.login(result.user);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        clinicId: result.clinic.id,
        clinicName: result.clinic.name,
        licenseNumber: result.user.licenseNumber,
      },
      clinic: {
        id: result.clinic.id,
        name: result.clinic.name,
        email: result.clinic.email,
        phone: result.clinic.phone,
        address: result.clinic.address,
        isActive: result.clinic.isActive,
        createdAt: result.clinic.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async checkNameAvailability(name: string): Promise<CheckNameResponse> {
    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters');
    }

    const existing = await this.prisma.clinic.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive',
        },
      },
    });

    return { available: !existing };
  }
}
