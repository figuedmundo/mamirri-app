import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLES, type Role } from '../constants/roles';

type AuthenticatedUser = {
  userId: string;
  role?: Role;
  clinicId?: string | null;
};

@Injectable()
export class ClinicRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      const role = user.role as Role | undefined;
      if (!role || !requiredRoles.includes(role)) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    if (user.role === ROLES.ADMIN) {
      return true;
    }

    if (!user.clinicId) {
      throw new ForbiddenException('User is not assigned to a clinic');
    }

    const clinic = await this.prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: { id: true, isActive: true },
    });

    if (!clinic || !clinic.isActive) {
      throw new ForbiddenException('Clinic is inactive or not found');
    }

    const clinicIdParam = request.params?.clinicId as string | undefined;
    if (clinicIdParam && clinicIdParam !== user.clinicId) {
      throw new NotFoundException('Resource not found');
    }

    return true;
  }
}
