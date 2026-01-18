import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadSessionPhotoDto {
  @ApiPropertyOptional({
    description: 'Optional caption for the photo',
    maxLength: 140,
    example: 'Aplicando técnica de Jones en trapecio',
  })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  caption?: string;
}
