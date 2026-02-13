import { NestFactory } from '@nestjs/core';
import { KnowledgeBaseModule } from '../src/modules/knowledge-base/knowledge-base.module';
import { KnowledgeBaseService } from '../src/modules/knowledge-base/knowledge-base.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
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
class UpdateAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(UpdateAppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);

  const args = process.argv.slice(2);
  const identifier = args[0];

  if (!identifier) {
    console.error(
      '\nUsage: pnpm knowledge:update <ID or filename.pdf> [options]',
    );
    console.error('\nOptions:');
    console.error('  --title "New Title"');
    console.error('  --author "Author Name"');
    console.error('  --volume "Tomo 1"');
    console.error('  --edition "5th Edition"');
    console.error('  --year "2023"');
    console.error('  --path "data/library/originals/new_filename.pdf"');
    process.exit(1);
  }

  const updates: any = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--title') updates.title = args[++i];
    if (args[i] === '--author') updates.author = args[++i];
    if (args[i] === '--volume') updates.volume = args[++i];
    if (args[i] === '--edition') updates.edition = args[++i];
    if (args[i] === '--year') updates.year = args[++i];
    if (args[i] === '--path') updates.filePath = args[++i];
  }

  console.log(`📝 Attempting to update metadata for: ${identifier}`);

  try {
    await knowledgeBaseService.updateMetadata(identifier, updates);
    console.log('✅ Update complete.');
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error during update:', err);
  process.exit(1);
});
