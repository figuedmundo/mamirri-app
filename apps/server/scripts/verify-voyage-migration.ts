import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log(
    '\n🔍 Verifying database migration for Voyage embeddings (1024 dims)...\n',
  );

  try {
    // 1. Check vector column dimension
    // We use a raw query to inspect table metadata
    const columnInfo: any[] = await prisma.$queryRaw`
      SELECT atttypmod 
      FROM pg_attribute 
      WHERE attrelid = 'embeddings'::regclass 
      AND attname = 'vector';
    `;

    if (columnInfo.length === 0) {
      console.log('❌ [FAILED] vector column not found in embeddings table');
      return;
    }

    const dimension = columnInfo[0].atttypmod;
    if (dimension === 1024) {
      console.log('✅ [PASSED] vector column dimension is 1024');
    } else {
      console.log(
        `❌ [FAILED] vector column dimension is ${dimension} (expected 1024)`,
      );
    }

    // 2. Check index existence
    const indexInfo: any[] = await prisma.$queryRaw`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'embeddings' 
      AND indexname = 'embeddings_vector_idx';
    `;

    if (indexInfo.length > 0) {
      console.log('✅ [PASSED] embeddings_vector_idx exists');
    } else {
      console.log(
        '⚠️ [WARNING] embeddings_vector_idx not found (might use a different name or be missing)',
      );
    }

    // 3. Test sample insertion and similarity search
    console.log('Testing sample vector operations...');
    const testVector = new Array(1024).fill(0.1);
    const vectorString = `[${testVector.join(',')}]`;

    // Temporary test document
    const doc = await prisma.document.create({
      data: {
        title: 'MIGRATION_TEST',
        filePath: '/tmp/migration_test.pdf',
      },
    });

    try {
      // Insert test embedding
      await prisma.$executeRaw`
        INSERT INTO embeddings (id, content, vector, "pageNumber", "documentId")
        VALUES (gen_random_uuid(), 'Test content', ${vectorString}::vector, 1, ${doc.id})
      `;
      console.log('✅ [PASSED] Sample 1024-dim vector insertion successful');

      // Test similarity search
      const results: any[] = await prisma.$queryRaw`
        SELECT id, content, vector <=> ${vectorString}::vector as distance
        FROM embeddings
        WHERE "documentId" = ${doc.id}
        LIMIT 1
      `;

      if (results.length > 0) {
        console.log(
          '✅ [PASSED] Similarity search on 1024-dim vectors successful',
        );
      } else {
        console.log('❌ [FAILED] Similarity search returned no results');
      }
    } finally {
      // Cleanup
      await prisma.document.delete({ where: { id: doc.id } });
      console.log('Cleaned up test data.');
    }
  } catch (error) {
    console.error('❌ [ERROR] Verification failed:', error.message);
  }
}

verifyMigration()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
