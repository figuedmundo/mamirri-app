import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testGeminiEmbedding() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: GOOGLE_API_KEY is missing in .env file');
    process.exit(1);
  }

  console.log('🔄 Initializing Google Generative AI...');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

  const text = 'The patient presents with acute pain in the plantar fascia.';

  console.log(`🧪 Testing embedding generation for text: "${text}"`);

  try {
    const result = await model.embedContent(text);
    const embedding = result.embedding;

    console.log('\n✅ Success! Embedding generated.');
    console.log(`📊 Vector Dimensions: ${embedding.values.length}`);
    console.log(
      `🔢 First 5 values: ${embedding.values.slice(0, 5).join(', ')}...`,
    );
  } catch (error: any) {
    console.error('\n❌ Embedding Generation Failed:');
    if (error.message) console.error(error.message);
    else console.error(error);
  }
}

testGeminiEmbedding();
