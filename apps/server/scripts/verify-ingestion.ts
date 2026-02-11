import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function verifyIngestion() {
  const markdownDir = path.resolve(__dirname, '../data/library/markdowns');
  const files = fs.readdirSync(markdownDir).filter((f) => f.endsWith('.md'));

  console.log(`\n🔍 Verifying ${files.length} books in knowledge base...\n`);

  for (const file of files) {
    const filePath = path.join(markdownDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. Re-calculate expected chunks (same logic as service)
    const { totalChunks, parentChunks } = simulateChunking(content);

    // Query DB for document by partial file path match since service uses absolute paths
    const doc = await prisma.document.findFirst({
      where: {
        OR: [
          { filePath: { contains: file } },
          { title: { contains: file.replace(/_/g, ' ').replace('.md', '') } },
        ],
      },
      include: {
        _count: {
          select: { embeddings: true },
        },
      },
    });

    if (!doc) {
      console.log(`❌ [MISSING] ${file} - Not found in database`);
      continue;
    }

    const dbCount = doc._count.embeddings;
    const expected = totalChunks + parentChunks;
    const completion = (dbCount / expected) * 100;

    const statusIcon = completion >= 100 ? '✅' : '⚠️';
    console.log(`${statusIcon} [${completion.toFixed(1)}%] ${doc.title}`);
    console.log(
      `   Expected: ~${expected} chunks (${parentChunks} parents + ${totalChunks} children)`,
    );
    console.log(`   Found:    ${dbCount} chunks`);

    if (dbCount < expected) {
      console.log(`   Missing:  ${expected - dbCount} chunks`);
    } else if (dbCount > expected) {
      console.log(
        `   Note:     DB has more chunks (maybe duplicates? or different chunking params?)`,
      );
    }
    console.log('---');
  }
}

// Minimal chunking simulator (must match KnowledgeBaseService logic roughly)
function simulateChunking(text: string) {
  // Logic from splitByPages
  const pageRegex = /<!-- PAGE_NUMBER: (\d+) -->/g;
  const pages = text.split(pageRegex).length / 2; // Approximation

  // Logic from chunkText (500 words)
  const words = text.split(/\s+/).filter((w) => w.length > 0).length;
  const totalChunks = Math.ceil(words / 450); // 500 words - 50 overlap approx
  const parentChunks = Math.ceil(totalChunks / 5);

  return { totalChunks, parentChunks };
}

verifyIngestion()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
