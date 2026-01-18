import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PostureVideoType {
  GAIT = 'gait',
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

export class UploadPostureVideoDto {
  @IsNotEmpty()
  @IsEnum(PostureVideoType)
  type: PostureVideoType;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  duration: number;
}
