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
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  /**
   * Get user profile by ID, excluding sensitive fields
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Exclude passwordHash and pinHash from response
    const { passwordHash, pinHash, ...result } = user;
    return result;
  }

  /**
   * Update user profile with partial data
   */
  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user with partial data
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });

    // Exclude passwordHash and pinHash from response
    const { passwordHash, pinHash, ...result } = updatedUser;
    return result;
  }

  /**
   * Change user password
   */
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

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true };
  }

  /**
   * Upload profile photo
   */
  async uploadPhoto(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Determine file extension
    const ext = file.originalname.split('.').pop() || 'jpg';
    const path = `users/${userId}/profile`;

    // Upload file to MinIO
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

    // Get public URL for the uploaded file
    const photoUrl = await this.storageService.getFileUrl(storageKey);

    // Update user profile
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhotoUrl: photoUrl },
    });

    // Exclude passwordHash and pinHash from response
    const { passwordHash, pinHash, ...result } = updatedUser;
    return result;
  }

  /**
   * Delete profile photo
   */
  async deletePhoto(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profilePhotoUrl) {
      throw new BadRequestException('No profile photo to delete');
    }

    // Try to extract storage key from URL
    // Note: This depends on how MinIO URLs are structured
    // For now, we'll update the database and let cleanup be handled separately if needed
    // or you can parse the URL to get the storage key

    // Update user to remove photo URL
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhotoUrl: null },
    });

    // Exclude passwordHash and pinHash from response
    const { passwordHash, pinHash, ...result } = updatedUser;
    return result;
  }
}
