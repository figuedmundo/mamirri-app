import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ROLES } from '../../common/constants/roles';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { InviteTherapistDto } from './dto/invite-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';

type CurrentUser = {
  userId: string;
  role: string;
  token: string;
  clinicId?: string | null;
};

type InvitationWithStatus = {
  id: string;
  email: string;
  role: string;
  token: string;
  createdAt: Date;
  usedAt: Date | null;
  expiresAt: Date;
  status: 'ACCEPTED' | 'PENDING' | 'EXPIRED';
};

@Injectable()
export class ClinicsService {
  private readonly logger = new Logger(ClinicsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async createClinic(dto: CreateClinicDto, currentUser: CurrentUser) {
    const normalizedName = dto.name.trim();
    const normalizedEmail = dto.email?.trim();

    if (normalizedName.length < 2) {
      throw new BadRequestException(
        'Clinic name must be at least 2 characters',
      );
    }

    if (!normalizedEmail) {
      throw new BadRequestException('Clinic email is required');
    }

    const existingByName = await this.prisma.clinic.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (existingByName) {
      throw new ConflictException('Clinic name is already in use');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: normalizedName,
          address: dto.address,
          phone: dto.phone,
          email: normalizedEmail,
          logoUrl: dto.logoUrl,
          businessHours: dto.businessHours as Prisma.InputJsonValue | undefined,
          subdomain: dto.subdomain,
          isActive: true,
        },
      });

      if (currentUser.role !== ROLES.ADMIN) {
        const user = await tx.user.findUnique({
          where: { id: currentUser.userId },
          select: { id: true, clinicId: true },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (user.clinicId) {
          throw new ConflictException('User already belongs to a clinic');
        }

        await tx.user.update({
          where: { id: currentUser.userId },
          data: {
            clinicId: clinic.id,
            clinicName: clinic.name,
            role: ROLES.CLINIC_OWNER,
          },
        });
      }

      const invitations = dto.initialInvitations ?? [];
      if (invitations.length > 0) {
        const existingEmails = await tx.user.findMany({
          where: {
            email: { in: invitations.map((inv) => inv.email) },
          },
          select: { email: true },
        });
        const existingSet = new Set(existingEmails.map((u) => u.email));

        for (const invitation of invitations) {
          if (existingSet.has(invitation.email)) {
            continue;
          }

          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

          await tx.clinicInvitation.create({
            data: {
              email: invitation.email,
              token,
              role: invitation.role ?? ROLES.THERAPIST,
              clinicId: clinic.id,
              invitedById: currentUser.userId,
              expiresAt,
            },
          });
        }
      }

      return {
        ...clinic,
        invitationsSent: invitations.length,
      };
    });

    if (currentUser.role !== ROLES.ADMIN) {
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: currentUser.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          clinicId: true,
          clinicName: true,
        },
      });

      if (updatedUser) {
        const tokens = this.authService.login(updatedUser);
        return {
          clinic: result,
          ...tokens,
        };
      }
    }

    return { clinic: result };
  }

  async checkNameAvailability(name: string) {
    const normalizedName = name?.trim();
    if (!normalizedName || normalizedName.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters');
    }

    const existing = await this.prisma.clinic.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    return { available: !existing };
  }

  async listClinics() {
    return this.prisma.clinic.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
          },
        },
      },
    });
  }

  async getClinicById(clinicId: string, currentUser: CurrentUser) {
    this.ensureClinicAccess(clinicId, currentUser);

    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
          },
        },
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return clinic;
  }

  async updateClinic(
    clinicId: string,
    dto: UpdateClinicDto,
    currentUser: CurrentUser,
  ) {
    this.ensureClinicAccess(clinicId, currentUser);

    const existing = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true, name: true },
    });
    if (!existing) {
      throw new NotFoundException('Clinic not found');
    }

    const normalizedName = dto.name?.trim();
    const normalizedEmail = dto.email?.trim();
    const normalizedSubdomain = dto.subdomain?.trim();

    if (
      dto.name !== undefined &&
      (!normalizedName || normalizedName.length < 2)
    ) {
      throw new BadRequestException(
        'Clinic name must be at least 2 characters',
      );
    }

    if (dto.email !== undefined && !normalizedEmail) {
      throw new BadRequestException('Clinic email cannot be empty');
    }

    if (
      normalizedName &&
      normalizedName.toLowerCase() !== existing.name.toLowerCase()
    ) {
      const duplicateName = await this.prisma.clinic.findFirst({
        where: {
          id: { not: clinicId },
          name: {
            equals: normalizedName,
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });

      if (duplicateName) {
        throw new ConflictException('Clinic name is already in use');
      }
    }

    return this.prisma.clinic.update({
      where: { id: clinicId },
      data: {
        name: normalizedName,
        address: dto.address,
        phone: dto.phone,
        email: normalizedEmail,
        logoUrl: dto.logoUrl,
        subdomain: normalizedSubdomain,
        businessHours: dto.businessHours as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async inviteTherapist(
    clinicId: string,
    dto: InviteTherapistDto,
    currentUser: CurrentUser,
  ) {
    this.ensureClinicOwnerAccess(clinicId, currentUser);

    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true, name: true, isActive: true },
    });

    if (!clinic || !clinic.isActive) {
      throw new NotFoundException('Clinic not found or inactive');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.clinicInvitation.create({
      data: {
        email: dto.email,
        token,
        role: dto.role ?? ROLES.THERAPIST,
        clinicId,
        invitedById: currentUser.userId,
        expiresAt,
      },
    });

    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const inviteUrl = `${baseUrl}/invite/accept?token=${invitation.token}`;

    // Send invitation email (graceful degradation if email service unavailable)
    try {
      await this.emailService.sendInvitationEmail({
        to: invitation.email,
        clinicName: clinic.name,
        inviteUrl,
        role: invitation.role,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send invitation email to ${invitation.email}:`,
        error,
      );
      // Don't fail the request - the invite URL is still returned
    }

    return {
      id: invitation.id,
      clinicId: invitation.clinicId,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      inviteUrl,
    };
  }
  async listInvitations(
    clinicId: string,
    currentUser: CurrentUser,
  ): Promise<InvitationWithStatus[]> {
    this.ensureClinicOwnerAccess(clinicId, currentUser);

    const invitations = await this.prisma.clinicInvitation.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();

    return invitations.map((inv) => {
      let status: 'ACCEPTED' | 'PENDING' | 'EXPIRED';

      if (inv.usedAt) {
        status = 'ACCEPTED';
      } else if (inv.expiresAt.getTime() < now) {
        status = 'EXPIRED';
      } else {
        status = 'PENDING';
      }

      return {
        id: inv.id,
        email: inv.email,
        role: inv.role,
        token: inv.token,
        createdAt: inv.createdAt,
        usedAt: inv.usedAt,
        expiresAt: inv.expiresAt,
        status,
      };
    });
  }

  async listTherapists(clinicId: string, currentUser: CurrentUser) {
    this.ensureClinicOwnerAccess(clinicId, currentUser);

    return this.prisma.user.findMany({
      where: {
        clinicId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTherapist(
    clinicId: string,
    userId: string,
    dto: UpdateTherapistDto,
    currentUser: CurrentUser,
  ) {
    this.ensureClinicOwnerAccess(clinicId, currentUser);

    const therapist = await this.prisma.user.findFirst({
      where: { id: userId, clinicId },
      select: { id: true },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found in this clinic');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: dto.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async removeTherapist(
    clinicId: string,
    userId: string,
    currentUser: CurrentUser,
  ) {
    this.ensureClinicOwnerAccess(clinicId, currentUser);

    const therapist = await this.prisma.user.findFirst({
      where: { id: userId, clinicId },
      select: { id: true },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found in this clinic');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        clinicId: null,
      },
    });

    return { success: true };
  }

  async migrateSoloPatients(clinicId: string, currentUser: CurrentUser) {
    this.ensureClinicOwnerAccess(clinicId, currentUser);

    const result = await this.prisma.patient.updateMany({
      where: {
        therapistId: currentUser.userId,
        clinicId: null,
      },
      data: {
        clinicId,
      },
    });

    return {
      clinicId,
      migratedCount: result.count,
    };
  }

  async consumeInvitation(token: string) {
    const invitation = await this.prisma.clinicInvitation.findUnique({
      where: { token },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.usedAt) {
      throw new ForbiddenException('Invitation already used');
    }

    if (invitation.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Invitation expired');
    }

    if (!invitation.clinic.isActive) {
      throw new ForbiddenException('Clinic is inactive');
    }

    return invitation;
  }

  async markInvitationUsed(invitationId: string) {
    await this.prisma.clinicInvitation.update({
      where: { id: invitationId },
      data: { usedAt: new Date() },
    });
  }

  private ensureClinicAccess(clinicId: string, currentUser: CurrentUser) {
    if (currentUser.role === ROLES.ADMIN) {
      return;
    }

    if (currentUser.clinicId !== clinicId) {
      throw new NotFoundException('Clinic not found');
    }
  }

  private ensureClinicOwnerAccess(clinicId: string, currentUser: CurrentUser) {
    if (currentUser.role === ROLES.ADMIN) {
      return;
    }

    if (currentUser.role !== ROLES.CLINIC_OWNER) {
      throw new ForbiddenException('Clinic owner permissions required');
    }

    if (currentUser.clinicId !== clinicId) {
      throw new NotFoundException('Clinic not found');
    }
  }
}
