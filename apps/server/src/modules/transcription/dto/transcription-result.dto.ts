export class TranscriptionResultDto {
  text: string;
  status: 'completed' | 'failed';
  error?: string;
  retryCount?: number;
}
