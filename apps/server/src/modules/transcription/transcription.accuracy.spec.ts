import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TranscriptionService } from './transcription.service';
import * as fs from 'fs';
import * as path from 'path';

// Helper to calculate Levenshtein distance for words (WER)
function calculateWER(reference: string, hypothesis: string): number {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

  const refWords = normalize(reference).split(' ');
  const hypWords = normalize(hypothesis).split(' ');

  const matrix = Array(refWords.length + 1)
    .fill(null)
    .map(() => Array(hypWords.length + 1).fill(0));

  for (let i = 0; i <= refWords.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= hypWords.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= refWords.length; i++) {
    for (let j = 1; j <= hypWords.length; j++) {
      const cost = refWords[i - 1] === hypWords[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  const distance = matrix[refWords.length][hypWords.length];
  const wer = (distance / refWords.length) * 100;
  return Math.round(wer * 100) / 100; // Round to 2 decimal places
}

// Check if critical medical terms are present (case-insensitive)
function checkMedicalTerms(
  text: string,
  requiredTerms: string[],
): { missing: string[]; accuracy: number } {
  const normalizedText = text.toLowerCase();
  const missing = requiredTerms.filter(
    (term) => !normalizedText.includes(term.toLowerCase()),
  );
  const accuracy =
    ((requiredTerms.length - missing.length) / requiredTerms.length) * 100;
  return { missing, accuracy };
}

// Skip tests if API key is not present
const apiKey = process.env.GROQ_API_KEY;
const runTests = apiKey ? describe : describe.skip;

runTests('Transcription Accuracy Integration Tests', () => {
  let service: TranscriptionService;
  const fixturesDir = path.join(__dirname, '__fixtures__');
  const audioDir = path.join(fixturesDir, 'audio');
  const expectedPath = path.join(fixturesDir, 'expected-transcriptions.json');

  let expectedTranscriptions: Record<
    string,
    { text: string; requiredTerms: string[] }
  >;

  beforeAll(async () => {
    // Load expected data
    if (fs.existsSync(expectedPath)) {
      const data = fs.readFileSync(expectedPath, 'utf-8');
      expectedTranscriptions = JSON.parse(data);
    } else {
      console.warn('Expected transcriptions file not found. Tests may fail.');
      expectedTranscriptions = {};
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptionService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'transcription') {
                return {
                  apiKey: apiKey,
                  model: 'whisper-large-v3',
                  language: 'es',
                  timeout: 30000, // Increased timeout for real API calls
                  maxRetries: 3,
                };
              }
              return null;
            },
          },
        },
      ],
    }).compile();

    service = module.get<TranscriptionService>(TranscriptionService);
  });

  // Dynamically generate tests for each fixture in the JSON file
  // We use a predefined list to ensure order, but fallback to Object.keys
  const fixtureFiles = [
    'conditions-1.m4a',
    'conditions-2.m4a',
    'conditions-3.m4a',
    'conditions-4.m4a',
    'conditions-5.m4a',
    'conditions-6.m4a',
    'clinical-tests.m4a',
    'scales-full.m4a',
  ];

  for (const filename of fixtureFiles) {
    it(`should accurately transcribe ${filename}`, async () => {
      const filePath = path.join(audioDir, filename);

      // Check if audio file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`Audio fixture not found: ${filename}, skipping test.`);
        return;
      }

      const audioBuffer = fs.readFileSync(filePath);
      const expected = expectedTranscriptions[filename];

      if (!expected) {
        throw new Error(`No expected data found for ${filename}`);
      }

      const startTime = Date.now();
      const result = await service.transcribe(audioBuffer, filename);
      const duration = Date.now() - startTime;

      expect(result.status).toBe('completed');
      expect(result.text).toBeTruthy();

      if (duration > 5000) {
        console.warn(`Latency warning for ${filename}: ${duration}ms`);
      }

      const termCheck = checkMedicalTerms(result.text, expected.requiredTerms);
      if (termCheck.missing.length > 0) {
        console.error(
          `Missing terms in ${filename}:`,
          termCheck.missing.join(', '),
        );
        console.log('Actual text:', result.text);
      }
      expect(termCheck.accuracy).toBe(100);

      const wer = calculateWER(expected.text, result.text);
      if (wer > 10) {
        console.warn(`High WER for ${filename}: ${wer}%`);
        console.log('Expected:', expected.text);
        console.log('Actual:  ', result.text);
      }
      expect(wer).toBeLessThanOrEqual(10);
    }, 35000); // Test timeout 35s
  }
});
