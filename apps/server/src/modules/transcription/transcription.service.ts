import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { TranscriptionResultDto } from './dto/transcription-result.dto';
import { PHYSIO_TRANSCRIPTION_PROMPT } from './constants/prompts';
import { withRetry } from './utils/retry';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly groq: Groq;
  private readonly model: string;
  private readonly language: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get('transcription') || {};

    this.groq = new Groq({
      apiKey: config.apiKey || process.env.GROQ_API_KEY,
    });

    this.model = config.model || 'whisper-large-v3';
    this.language = config.language || 'es';
    this.timeout = config.timeout || 60000;
    this.maxRetries = config.maxRetries || 5;
  }

  async transcribe(
    audioBuffer: Buffer,
    filename: string,
  ): Promise<TranscriptionResultDto> {
    try {
      const file = await Groq.toFile(audioBuffer, filename, {
        type: 'audio/mpeg',
      });

      const transcriptionPromise = withRetry(
        async () => {
          return await this.groq.audio.transcriptions.create({
            file,
            model: this.model,
            language: this.language,
            prompt: PHYSIO_TRANSCRIPTION_PROMPT,
            response_format: 'json',
          });
        },
        { maxRetries: this.maxRetries },
        this.logger,
      );

      const result = await this.withTimeout(transcriptionPromise, this.timeout);

      return {
        text: result.text,
        status: 'completed',
        retryCount: 0,
      };
    } catch (error: any) {
      const isTimeout = error.message.includes('timed out');
      this.logger.error(
        `Transcription failed${isTimeout ? ' (Timeout)' : ''}: ${error.message}`,
        error.stack,
      );

      if (error.response?.data) {
        this.logger.error(
          `Groq API Error Details: ${JSON.stringify(error.response.data)}`,
        );
      } else if (error.cause) {
        this.logger.error(`Error Cause: ${error.cause.message}`);
      }

      return {
        text: '',
        status: 'failed',
        error: error.message,
      };
    }
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }, ms);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId!);
      return result;
    } catch (error) {
      clearTimeout(timeoutId!);
      throw error;
    }
  }
}
