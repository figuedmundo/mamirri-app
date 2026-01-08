import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class UploadFileDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class GetFileUrlDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expiry?: number;
}
