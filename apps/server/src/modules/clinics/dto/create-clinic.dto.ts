import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class InitialInvitationDto {
  @ApiProperty({ description: 'Invitee email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Role for invited user' })
  @IsOptional()
  @IsString()
  @IsIn(['THERAPIST', 'CLINIC_OWNER'])
  role?: 'THERAPIST' | 'CLINIC_OWNER';
}

export class CreateClinicDto {
  @ApiProperty({ description: 'Clinic display name' })
  @IsString()
  @Length(2, 120)
  name: string;

  @ApiPropertyOptional({ description: 'Clinic address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Clinic contact phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Clinic contact email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Clinic logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Clinic business hours JSON' })
  @IsOptional()
  businessHours?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Clinic subdomain slug' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  subdomain?: string;

  @ApiPropertyOptional({ type: [InitialInvitationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialInvitationDto)
  initialInvitations?: InitialInvitationDto[];
}
