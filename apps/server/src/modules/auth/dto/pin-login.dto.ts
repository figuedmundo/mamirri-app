import { IsEmail, IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PinLoginDto {
  @ApiProperty({ example: 'test@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '1234', description: '4-digit PIN' })
  @IsNumberString()
  @IsNotEmpty()
  @Length(4, 4)
  pin: string;
}
