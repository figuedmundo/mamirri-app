import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckNameQueryDto {
  @ApiProperty({
    description: 'Clinic name to check for availability',
    example: 'Fisioterapia García',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;
}
