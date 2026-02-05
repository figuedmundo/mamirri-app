import { IsNotEmpty, Length, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetupPinDto {
  @ApiProperty({ example: '1234', description: '4-digit PIN' })
  @IsNotEmpty()
  @IsNumberString()
  @Length(4, 4)
  pin: string;
}
