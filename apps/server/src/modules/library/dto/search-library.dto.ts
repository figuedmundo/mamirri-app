import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class SearchLibraryDto {
  @ApiPropertyOptional({ description: 'Natural language search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Include archived protocols (admin only)',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  includeDeleted?: boolean;
}
