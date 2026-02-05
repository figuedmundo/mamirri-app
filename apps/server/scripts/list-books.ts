import { NestFactory } from '@nestjs/core';
import { KnowledgeBaseModule } from '../src/modules/knowledge-base/knowledge-base.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    KnowledgeBaseModule,
  ],
})
class ListAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ListAppModule);
  const prisma = app.get(PrismaService);

  const docs = await (prisma as any).document.findMany({
    include: {
      _count: {
        select: { embeddings: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\n📚 INGESTED BOOKS LIBRARY\n');
  console.log(''.padEnd(120, '-'));
  console.log(
    `${'ID'.padEnd(38)} | ${'TITLE'.padEnd(40)} | ${'VOL'.padEnd(8)} | ${'CHUNKS'.padEnd(8)} | ${'FILE PATH'}`,
  );
  console.log(''.padEnd(120, '-'));

  docs.forEach((doc: any) => {
    const volume = doc.metadata?.volume || '-';
    console.log(
      `${doc.id.padEnd(38)} | ${doc.title.substring(0, 40).padEnd(40)} | ${volume.padEnd(8)} | ${String(doc._count.embeddings).padEnd(8)} | ${doc.filePath}`,
    );
  });

  if (docs.length === 0) {
    console.log('   No books ingested yet.');
  }

  console.log(''.padEnd(120, '-'));
  console.log(`\nTotal: ${docs.length} books\n`);

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error listing books:', err);
  process.exit(1);
});
