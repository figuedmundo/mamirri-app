import { IsEnum, IsNotEmpty } from 'class-validator';

export enum FootprintType {
  INITIAL = 'initial',
  FINAL = 'final',
  FOLLOWUP = 'followup',
}

export class UploadFootprintDto {
  @IsNotEmpty()
  @IsEnum(FootprintType)
  type: FootprintType;
}
