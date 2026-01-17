import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateObjectivesDto {
  @ApiPropertyOptional({
    description: 'Therapeutic objective - clinical outcomes for the condition',
    example: 'Reducir dolor lumbar de 9/10 a 3/10. Recuperar movilidad.',
  })
  @IsOptional()
  @IsString()
  therapeutic?: string;

  @ApiPropertyOptional({
    description: 'Prophylactic objective - prevention strategies',
    example: 'Prevenir recurrencia mediante fortalecimiento de core.',
  })
  @IsOptional()
  @IsString()
  prophylactic?: string;

  @ApiPropertyOptional({
    description: 'Educational objective - patient guidance and training',
    example: 'Enseñar postura ergonómica. Programa de ejercicios en casa.',
  })
  @IsOptional()
  @IsString()
  educational?: string;
}
