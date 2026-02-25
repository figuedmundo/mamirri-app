import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { SetupPinDto } from './dto/setup-pin.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { ROLES } from '../../common/constants/roles';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _hash, pinHash: _pinHash, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      clinicId: user.clinicId ?? null,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'refreshSecretKey',
      expiresIn: '7d',
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: ROLES.THERAPIST,
        clinicName: null,
        clinicId: null,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _unneeded, pinHash: _pinUnneeded, ...result } = user;
    return this.login(result);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'refreshSecretKey',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _hash, pinHash: _pinHash, ...result } = user;
      return this.login(result);
    } catch {
      throw new UnauthorizedException();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logout(_userId: string) {
    return true;
  }

  async setupPin(userId: string, setupPinDto: SetupPinDto) {
    const { pin } = setupPinDto;
    const salt = await bcrypt.genSalt();
    const pinHash = await bcrypt.hash(pin, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash },
    });

    return { success: true };
  }

  async validatePin(email: string, pin: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.pinHash) {
      throw new UnauthorizedException('Invalid PIN or user has no PIN set');
    }

    const isMatch = await bcrypt.compare(pin, user.pinHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid PIN');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _hash, pinHash: _pin, ...result } = user;
    return this.login(result);
  }

  async acceptInvitation(dto: AcceptInviteDto) {
    const invitation = await this.prisma.clinicInvitation.findUnique({
      where: { token: dto.token },
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

    if (invitation.email.toLowerCase() !== dto.email.toLowerCase()) {
      throw new ForbiddenException('Invitation email mismatch');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: invitation.role,
        clinicId: invitation.clinicId,
        clinicName: invitation.clinic.name,
        licenseNumber: dto.licenseNumber,
      },
    });

    await this.prisma.clinicInvitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _hash, pinHash: _pinHash, ...result } = user;
    return this.login(result);
  }

  async getInvitation(token: string) {
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

    if (invitation.usedAt || invitation.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Invitation is no longer valid');
    }

    return {
      email: invitation.email,
      role: invitation.role,
      clinicName: invitation.clinic.name,
      expiresAt: invitation.expiresAt,
    };
  }

  async getPinStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinHash: true },
    });

    return { hasPinSet: !!user?.pinHash };
  }
}
