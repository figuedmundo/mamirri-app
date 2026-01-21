import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TranscriptionService } from './transcription.service';
import Groq from 'groq-sdk';

jest.mock('groq-sdk', () => {
  const mGroq = jest.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: jest.fn(),
      },
    },
  }));
  (mGroq as any).toFile = jest.fn().mockResolvedValue('mock-file');
  return {
    __esModule: true,
    default: mGroq,
  };
});

describe('TranscriptionService', () => {
  let service: TranscriptionService;
  let groqMock: any;
  let configServiceMock: any;

  const mockAudioBuffer = Buffer.from('test-audio');
  const mockFilename = 'test.m4a';

  beforeEach(async () => {
    (Groq as unknown as jest.Mock).mockClear();

    configServiceMock = {
      get: jest.fn().mockReturnValue({
        apiKey: 'test-key',
        model: 'whisper-large-v3',
        language: 'es',
        timeout: 5000,
        maxRetries: 3,
      }),
    };

    const createMock = jest.fn();
    (Groq as unknown as jest.Mock).mockImplementation(() => ({
      audio: {
        transcriptions: {
          create: createMock,
        },
      },
    }));
    groqMock = { audio: { transcriptions: { create: createMock } } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptionService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<TranscriptionService>(TranscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should transcribe audio successfully', async () => {
    groqMock.audio.transcriptions.create.mockResolvedValue({
      text: 'Transcribed text',
    });

    const result = await service.transcribe(mockAudioBuffer, mockFilename);

    expect(result.status).toBe('completed');
    expect(result.text).toBe('Transcribed text');
    expect(groqMock.audio.transcriptions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'whisper-large-v3',
        language: 'es',
      }),
    );
  });

  it('should handle timeout', async () => {
    groqMock.audio.transcriptions.create.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 6000)),
    );

    const result = await service.transcribe(mockAudioBuffer, mockFilename);

    expect(result.status).toBe('failed');
    expect(result.error).toContain('timed out');
  }, 7000);

  it('should retry on rate limit (mocked error)', async () => {
    groqMock.audio.transcriptions.create
      .mockRejectedValueOnce(new Error('429 Too Many Requests'))
      .mockResolvedValueOnce({ text: 'Success after retry' });

    const result = await service.transcribe(mockAudioBuffer, mockFilename);

    expect(result.status).toBe('completed');
    expect(result.text).toBe('Success after retry');
    expect(groqMock.audio.transcriptions.create).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    configServiceMock.get.mockReturnValue({
      apiKey: 'test-key',
      model: 'whisper-large-v3',
      language: 'es',
      timeout: 10000,
      maxRetries: 3,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptionService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();
    service = module.get<TranscriptionService>(TranscriptionService);

    groqMock.audio.transcriptions.create.mockRejectedValue(
      new Error('API Error'),
    );

    const result = await service.transcribe(mockAudioBuffer, mockFilename);

    expect(result.status).toBe('failed');
    expect(groqMock.audio.transcriptions.create).toHaveBeenCalledTimes(4);
  }, 20000);
});
