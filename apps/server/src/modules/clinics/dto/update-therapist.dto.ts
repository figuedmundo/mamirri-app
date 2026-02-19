import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateTherapistDto {
  @ApiPropertyOptional({ description: 'Role update' })
  @IsOptional()
  @IsString()
  @IsIn(['THERAPIST', 'CLINIC_OWNER'])
  role?: 'THERAPIST' | 'CLINIC_OWNER';

  @ApiPropertyOptional({ description: 'Enable/disable clinic account' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
