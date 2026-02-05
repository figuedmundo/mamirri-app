import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Full name' })
  name: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string | null;

  @ApiPropertyOptional({ description: 'Profile photo URL' })
  profilePhotoUrl?: string | null;

  @ApiPropertyOptional({ description: 'Clinic name' })
  clinicName?: string | null;

  @ApiPropertyOptional({ description: 'License number' })
  licenseNumber?: string | null;

  @ApiPropertyOptional({ description: 'Specialty' })
  specialty?: string | null;

  @ApiPropertyOptional({ description: 'Years of experience' })
  yearsExperience?: number | null;
}
