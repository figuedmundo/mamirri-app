import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeImageDto {
  @ApiProperty({
    description: 'ID of the image record (Footprint or Posturogram)',
    example: 'uuid-here',
  })
  @IsString()
  @IsNotEmpty()
  imageId: string;

  @ApiProperty({
    description: 'Type of image being analyzed',
    enum: ['POSTUROGRAM', 'FOOTPRINT'],
    example: 'POSTUROGRAM',
  })
  @IsEnum(['POSTUROGRAM', 'FOOTPRINT'])
  imageType: 'POSTUROGRAM' | 'FOOTPRINT';
}
