import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum FootprintType {
  INITIAL = 'initial',
  FINAL = 'final',
  FOLLOWUP = 'followup',
}

export enum FootprintSide {
  LEFT = 'left',
  RIGHT = 'right',
  UNKNOWN = 'unknown',
}

export class UploadFootprintDto {
  @IsNotEmpty()
  @IsEnum(FootprintType)
  type: FootprintType;

  @IsOptional()
  @IsEnum(FootprintSide)
  side?: FootprintSide;
}
