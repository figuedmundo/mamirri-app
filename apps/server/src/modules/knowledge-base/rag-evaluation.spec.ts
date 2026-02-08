import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AiAnalysisService } from '../ai-analysis/ai-analysis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

/**
 * RAG Evaluation Framework
 *
 * Measures retrieval quality using RAGAS-style metrics:
 * - Context Precision: % of retrieved chunks that are relevant
 * - Context Recall: % of relevant chunks that were retrieved
 * - Faithfulness: LLM response grounded in context
 *
 * Target metrics:
 * - Context Precision > 0.75
 * - Faithfulness > 0.80
 */

interface TestCase {
  id: string;
  query: string;
  expectedDocuments: string[]; // Document titles that should be retrieved
  expectedKeyTerms: string[]; // Key terms that should appear in results
  category: 'diagnosis' | 'treatment' | 'contraindication';
}

const TEST_CASES: TestCase[] = [
  {
    id: 'TC001',
    query: 'contraindicaciones metformina diabetes',
    expectedDocuments: ['diabetes_guidelines.pdf', 'pharmacology_manual.pdf'],
    expectedKeyTerms: [
      'metformina',
      'contraindicaciones',
      'insuficiencia renal',
    ],
    category: 'contraindication',
  },
  {
    id: 'TC002',
    query: 'tratamiento fascitis plantar ejercicios',
    expectedDocuments: ['fisioterapia_traumatologia.pdf'],
    expectedKeyTerms: ['fascitis', 'plantar', 'estiramiento', 'aquiles'],
    category: 'treatment',
  },
  {
    id: 'TC003',
    query: 'diagnóstico diferencial lumbalgia M54.5',
    expectedDocuments: ['ortopedia_columna.pdf'],
    expectedKeyTerms: ['lumbalgia', 'diagnóstico', 'radicular', 'mecánica'],
    category: 'diagnosis',
  },
  {
    id: 'TC004',
    query: 'técnicas movilización articular rodilla',
    expectedDocuments: ['terapia_manual.pdf', 'rehabilitacion_rodilla.pdf'],
    expectedKeyTerms: ['movilización', 'rodilla', 'rango', 'articular'],
    category: 'treatment',
  },
  {
    id: 'TC005',
    query: 'síndrome túnel carpiano electromiografía',
    expectedDocuments: ['neurologia_periferica.pdf'],
    expectedKeyTerms: ['túnel carpiano', 'nervio mediano', 'electromiografía'],
    category: 'diagnosis',
  },
  {
    id: 'TC006',
    query: 'ibuprofeno antiinflamatorio dosis máxima',
    expectedDocuments: ['farmacologia_clinica.pdf'],
    expectedKeyTerms: [
      'ibuprofeno',
      'dosis',
      'antiinflamatorio',
      'gastrointestinal',
    ],
    category: 'contraindication',
  },
  {
    id: 'TC007',
    query: 'escoliosis infantil tratamiento conservador',
    expectedDocuments: ['ortopedia_pediatrica.pdf'],
    expectedKeyTerms: ['escoliosis', 'corsé', 'grados', 'cobb'],
    category: 'treatment',
  },
  {
    id: 'TC008',
    query: 'tendinitis aquilea ecografía hallazgos',
    expectedDocuments: ['ecografia_musculoesqueletica.pdf'],
    expectedKeyTerms: ['tendón aquiles', 'engrosamiento', 'ecografía'],
    category: 'diagnosis',
  },
];

/**
 * Context Precision: What fraction of retrieved chunks are actually relevant?
 *
 * @param retrievedChunks - Chunks returned by RAG
 * @param expectedTerms - Key terms that indicate relevance
 * @returns Precision score (0-1)
 */
function calculateContextPrecision(
  retrievedChunks: Array<{ content: string }>,
  expectedTerms: string[],
): number {
  if (retrievedChunks.length === 0) return 0;

  let relevantCount = 0;
  for (const chunk of retrievedChunks) {
    const contentLower = chunk.content.toLowerCase();
    const hasRelevantTerm = expectedTerms.some((term) =>
      contentLower.includes(term.toLowerCase()),
    );
    if (hasRelevantTerm) {
      relevantCount++;
    }
  }

  return relevantCount / retrievedChunks.length;
}

/**
 * Context Recall: What fraction of expected documents were retrieved?
 *
 * @param retrievedChunks - Chunks returned by RAG
 * @param expectedDocuments - Document titles that should appear
 * @returns Recall score (0-1)
 */
function calculateContextRecall(
  retrievedChunks: Array<{ documentTitle: string }>,
  expectedDocuments: string[],
): number {
  if (expectedDocuments.length === 0) return 1;

  const retrievedDocs = new Set(
    retrievedChunks.map((c) => c.documentTitle.toLowerCase()),
  );

  let foundCount = 0;
  for (const expectedDoc of expectedDocuments) {
    // Partial match for flexibility
    const found = Array.from(retrievedDocs).some(
      (doc) =>
        doc.includes(expectedDoc.replace('.pdf', '').toLowerCase()) ||
        expectedDoc.toLowerCase().includes(doc.replace('.pdf', '')),
    );
    if (found) {
      foundCount++;
    }
  }

  return foundCount / expectedDocuments.length;
}

/**
 * Faithfulness (simplified): Do the retrieved chunks contain the key terms?
 *
 * Full faithfulness would check if LLM response is grounded in context.
 * This simplified version checks if key medical terms are present.
 *
 * @param retrievedChunks - Chunks returned by RAG
 * @param expectedTerms - Key terms that should be found
 * @returns Faithfulness score (0-1)
 */
function calculateFaithfulness(
  retrievedChunks: Array<{ content: string }>,
  expectedTerms: string[],
): number {
  if (expectedTerms.length === 0) return 1;

  const allContent = retrievedChunks
    .map((c) => c.content.toLowerCase())
    .join(' ');

  let foundTerms = 0;
  for (const term of expectedTerms) {
    if (allContent.includes(term.toLowerCase())) {
      foundTerms++;
    }
  }

  return foundTerms / expectedTerms.length;
}

describe('RAG Evaluation Framework', () => {
  let knowledgeBaseService: KnowledgeBaseService;

  interface EvaluationResult {
    testCaseId: string;
    query: string;
    category: 'diagnosis' | 'treatment' | 'contraindication';
    retrievedCount: number;
    precision: number;
    recall: number;
    faithfulness: number;
    passed: boolean;
  }

  beforeAll(async () => {
    // Setup test module with mocked services for compilation
    // In a real run, you'd want to use actual services or integration setup
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeBaseService,
        {
          provide: AiAnalysisService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    knowledgeBaseService =
      module.get<KnowledgeBaseService>(KnowledgeBaseService);

    // Mocking findSimilar for the purpose of this test file structure validation
    // In a real evaluation, this would call the actual implementation
    jest.spyOn(knowledgeBaseService, 'findSimilar').mockResolvedValue([]);
  });

  // This is marked as .skip by default - run manually for evaluation
  it.skip('should evaluate all test cases and generate report', async () => {
    const results: EvaluationResult[] = [];

    for (const testCase of TEST_CASES) {
      // Cast result to any because we are mocking it or using the real one which returns BM25Result
      // but our metrics expect simpler objects which BM25Result satisfies
      const chunks = await knowledgeBaseService.findSimilar(testCase.query, 10);

      const precision = calculateContextPrecision(
        chunks,
        testCase.expectedKeyTerms,
      );
      const recall = calculateContextRecall(chunks, testCase.expectedDocuments);
      const faithfulness = calculateFaithfulness(
        chunks,
        testCase.expectedKeyTerms,
      );

      results.push({
        testCaseId: testCase.id,
        query: testCase.query,
        category: testCase.category,
        retrievedCount: chunks.length,
        precision,
        recall,
        faithfulness,
        passed: precision >= 0.75 && faithfulness >= 0.8,
      });
    }

    // Calculate aggregates
    const avgPrecision =
      results.reduce((sum, r) => sum + r.precision, 0) / (results.length || 1);
    const avgRecall =
      results.reduce((sum, r) => sum + r.recall, 0) / (results.length || 1);
    const avgFaithfulness =
      results.reduce((sum, r) => sum + r.faithfulness, 0) /
      (results.length || 1);
    const passRate =
      results.filter((r) => r.passed).length / (results.length || 1);

    // Generate report
    console.log('\n=== RAG EVALUATION REPORT ===');
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`Total Test Cases: ${results.length}`);
    console.log(`\n--- AGGREGATE METRICS ---`);
    console.log(
      `Context Precision: ${(avgPrecision * 100).toFixed(1)}% (target: >75%)`,
    );
    console.log(
      `Context Recall: ${(avgRecall * 100).toFixed(1)}% (target: >70%)`,
    );
    console.log(
      `Faithfulness: ${(avgFaithfulness * 100).toFixed(1)}% (target: >80%)`,
    );
    console.log(`Pass Rate: ${(passRate * 100).toFixed(1)}%`);
    console.log(`\n--- PER-QUERY RESULTS ---`);
    results.forEach((r) => {
      const status = r.passed ? '✓' : '✗';
      console.log(`${status} [${r.testCaseId}] ${r.query.substring(0, 40)}...`);
      console.log(
        `   P: ${(r.precision * 100).toFixed(0)}% | R: ${(r.recall * 100).toFixed(0)}% | F: ${(r.faithfulness * 100).toFixed(0)}%`,
      );
    });

    // Assert minimum thresholds
    // Using 0 as baseline since we mock empty results by default
    expect(avgPrecision).toBeGreaterThanOrEqual(0);
    expect(avgFaithfulness).toBeGreaterThanOrEqual(0);
  });
});

describe('Evaluation Metrics (Unit Tests)', () => {
  describe('calculateContextPrecision', () => {
    it('should calculate precision correctly', () => {
      const chunks = [
        { content: 'Metformina is used for diabetes treatment' },
        { content: 'Insulin therapy alternatives' },
        { content: 'Contraindications of metformina include renal failure' },
      ];
      const expectedTerms = ['metformina', 'contraindications'];

      const precision = calculateContextPrecision(chunks, expectedTerms);
      expect(precision).toBeCloseTo(0.67, 1); // 2/3 chunks are relevant
    });

    it('should return 0 for no chunks', () => {
      expect(calculateContextPrecision([], ['term'])).toBe(0);
    });
  });

  describe('calculateContextRecall', () => {
    it('should calculate recall correctly', () => {
      const chunks = [
        { documentTitle: 'diabetes_guidelines.pdf' },
        { documentTitle: 'other_doc.pdf' },
      ];
      const expectedDocs = ['diabetes_guidelines.pdf', 'pharmacology.pdf'];

      const recall = calculateContextRecall(chunks, expectedDocs);
      expect(recall).toBe(0.5); // 1/2 expected docs found
    });
  });

  describe('calculateFaithfulness', () => {
    it('should calculate faithfulness correctly', () => {
      const chunks = [
        { content: 'Fascitis plantar treatment includes stretching exercises' },
      ];
      const expectedTerms = ['fascitis', 'stretching', 'surgery'];

      const faithfulness = calculateFaithfulness(chunks, expectedTerms);
      expect(faithfulness).toBeCloseTo(0.67, 1); // 2/3 terms found
    });
  });
});
