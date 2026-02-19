import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env'), quiet: true });

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('${')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    '${POSTGRES_USER}',
    process.env.POSTGRES_USER || '',
  )
    .replace('${POSTGRES_PASSWORD}', process.env.POSTGRES_PASSWORD || '')
    .replace('${POSTGRES_PORT}', process.env.POSTGRES_PORT || '5432')
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || '');
}

describe('Knowledge Base Database Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let documentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: path.resolve(process.cwd(), '../../.env'),
        }),
        PrismaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (documentId) {
      await prisma.$executeRaw`DELETE FROM embeddings WHERE "documentId" = ${documentId}`;
      await prisma.$executeRaw`DELETE FROM documents WHERE id = ${documentId}`;
    }
    await prisma.$disconnect();
    await app.close();
  });

  it('should create a Document record', async () => {
    const documentData = {
      title: 'Test Anatomy Book',
      author: 'Dr. Test',
      filePath: `data/library/markdowns/test-anatomy-${Date.now()}.pdf`,
    };

    const document = await (prisma as any).document.create({
      data: documentData,
    });

    documentId = document.id;
    expect(document).toBeDefined();
    expect(document.title).toBe(documentData.title);
    expect(document.filePath).toBe(documentData.filePath);
  });

  it('should create an Embedding record associated with a Document', async () => {
    const testVector = Array(1024).fill(0);
    const vectorString = `[${testVector.join(',')}]`;
    const embeddingId = crypto.randomUUID();

    await prisma.$executeRaw`
      INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector)
      VALUES (${embeddingId}, 'This is a test chunk of anatomical text.', 1, ${documentId}, ${vectorString}::vector)
    `;

    const embedding: any = await (prisma as any).embedding.findUnique({
      where: { id: embeddingId },
    });

    expect(embedding).toBeDefined();
    expect(embedding.content).toBe('This is a test chunk of anatomical text.');
    expect(embedding.documentId).toBe(documentId);
  });

  it('should perform a similarity search using pgvector', async () => {
    const uniqueContent = `Unique search test chunk ${Date.now()}`;
    const testVector = Array(1024).fill(0.5);
    testVector[0] = 0.99;
    const vectorString = `[${testVector.join(',')}]`;

    await prisma.$executeRaw`
      INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector)
      VALUES (gen_random_uuid(), ${uniqueContent}, 1, ${documentId}, ${vectorString}::vector)
    `;

    const results: any[] = await prisma.$queryRaw`
      SELECT content, (vector <=> ${vectorString}::vector) as distance
      FROM embeddings
      WHERE content = ${uniqueContent}
      ORDER BY vector <=> ${vectorString}::vector
      LIMIT 1
    `;

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toBe(uniqueContent);
    expect(Number(results[0].distance)).toBeCloseTo(0);
  });
});
