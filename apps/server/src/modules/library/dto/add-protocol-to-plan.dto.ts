import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddProtocolToPlanDto {
  @ApiProperty({ description: 'Protocol ID to add' })
  @IsNotEmpty()
  @IsString()
  protocolId: string;

  @ApiPropertyOptional({
    description: 'Optional notes about why this protocol was added',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
