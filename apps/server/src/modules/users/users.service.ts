import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, pinHash, ...result } = user as any;
    return result;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, pinHash, ...result } = updatedUser as any;
    return result;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirmation do not match',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true };
  }

  async uploadPhoto(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const path = `users/${userId}/profile`;

    const storageKey = await this.storageService.uploadFile(
      {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      path,
    );

    const photoUrl = await this.storageService.getFileUrl(storageKey);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhotoUrl: photoUrl } as any,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, pinHash, ...result } = updatedUser as any;
    return result;
  }

  async deletePhoto(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(user as any).profilePhotoUrl) {
      throw new BadRequestException('No profile photo to delete');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhotoUrl: null } as any,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, pinHash, ...result } = updatedUser as any;
    return result;
  }
}
