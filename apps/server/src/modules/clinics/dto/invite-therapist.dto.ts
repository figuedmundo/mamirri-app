import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class InviteTherapistDto {
  @ApiProperty({ description: 'Invitee email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Role for invited user' })
  @IsOptional()
  @IsString()
  @IsIn(['THERAPIST', 'CLINIC_OWNER'])
  role?: 'THERAPIST' | 'CLINIC_OWNER';
}
