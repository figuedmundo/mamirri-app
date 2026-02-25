import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProtocolDto {
  @ApiProperty({ description: 'Protocol title', minLength: 3, maxLength: 120 })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ description: 'Clinical category ID' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ description: 'Clinical definition', maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  definition!: string;

  @ApiProperty({ description: 'Clinical rationale', maxLength: 4000 })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  rationale!: string;

  @ApiProperty({
    description: 'Procedure steps',
    type: [String],
    minItems: 1,
    maxItems: 50,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  procedure!: string[];

  @ApiPropertyOptional({
    description: 'Tags for quick search',
    type: [String],
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(24, { each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Reference IDs to attach',
    type: [String],
    maxItems: 20,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  referenceIds?: string[];
}
