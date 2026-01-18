import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadVoiceNoteDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  durationSeconds: number;
}
