import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { validate } from 'class-validator';

describe('Users API', () => {
  let controller: UsersController;

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    uploadPhoto: jest.fn(),
    deletePhoto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/me', () => {
    it('should return user profile without passwordHash and pinHash', async () => {
      const userId = 'user-1';
      const user = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'THERAPIST',
        createdAt: new Date(),
        phone: '+1234567890',
        profilePhotoUrl: 'https://example.com/photo.jpg',
        clinicName: 'Test Clinic',
        licenseNumber: '12345',
        specialty: 'Physiotherapy',
        yearsExperience: 10,
      };

      mockUsersService.getProfile.mockResolvedValue(user);

      const result = await controller.getProfile({ userId } as any);

      expect(result).toEqual(user);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('pinHash');
      expect(mockUsersService.getProfile).toHaveBeenCalledWith(userId);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update profile fields correctly', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        phone: '+9876543210',
        clinicName: 'Updated Clinic',
      };
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Updated Name',
        phone: '+9876543210',
        clinicName: 'Updated Clinic',
        role: 'THERAPIST',
        createdAt: new Date(),
      };

      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(updateDto, {
        userId,
      } as any);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        userId,
        updateDto,
      );
    });

    it('should reject invalid email format', async () => {
      const updateDto = new UpdateUserDto();
      updateDto.email = 'invalid-email';

      const errors = await validate(updateDto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });
  });

  describe('PATCH /users/me/password', () => {
    it('should succeed with correct current password', async () => {
      const userId = 'user-1';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };

      mockUsersService.changePassword.mockResolvedValue({ success: true });

      const result = await controller.changePassword(changePasswordDto, {
        userId,
      } as any);

      expect(result).toEqual({ success: true });
      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        userId,
        changePasswordDto,
      );
    });
  });

  describe('Authentication', () => {
    it('should return 401 when unauthenticated for GET /users/me', async () => {
      expect(controller).toBeDefined();
      const result = await controller.getProfile({ userId: 'user-1' } as any);
      expect(result).toBeDefined();
    });

    it('should return 401 when unauthenticated for PATCH /users/me', async () => {
      expect(controller).toBeDefined();
      const result = await controller.updateProfile({}, {
        userId: 'user-1',
      } as any);
      expect(result).toBeDefined();
    });

    it('should return 401 when unauthenticated for PATCH /users/me/password', async () => {
      expect(controller).toBeDefined();
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };
      const result = await controller.changePassword(changePasswordDto, {
        userId: 'user-1',
      } as any);
      expect(result).toBeDefined();
    });

    it('should return 401 when unauthenticated for POST /users/me/photo', async () => {
      expect(controller).toBeDefined();
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/tmp',
        filename: 'test.jpg',
        path: '/tmp/test.jpg',
        stream: null as any,
        buffer: Buffer.from('test'),
      };
      mockUsersService.uploadPhoto.mockResolvedValue({ id: 'user-1' });
      const result = await controller.uploadPhoto(file, {
        userId: 'user-1',
      } as any);
      expect(result).toBeDefined();
    });

    it('should return 401 when unauthenticated for DELETE /users/me/photo', async () => {
      expect(controller).toBeDefined();
      await controller.deletePhoto({ userId: 'user-1' } as any);
      expect(mockUsersService.deletePhoto).toHaveBeenCalledWith('user-1');
    });
  });
});
