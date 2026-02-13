import { registerAs } from '@nestjs/config';

export default registerAs('voyage', () => ({
  apiKey: process.env.VOYAGE_API_KEY,
  documentModel: process.env.VOYAGE_DOCUMENT_MODEL || 'voyage-4-large',
  queryModel: process.env.VOYAGE_QUERY_MODEL || 'voyage-4',
  realtimeBatchLimit: parseInt(
    process.env.VOYAGE_REALTIME_BATCH_LIMIT || '1000',
    10,
  ),
  jobFileLimit: parseInt(process.env.VOYAGE_JOB_FILE_LIMIT || '100000', 10),
  rateLimitRpm: parseInt(process.env.VOYAGE_RATE_LIMIT_RPM || '300', 10),
  rateLimitTpm: parseInt(process.env.VOYAGE_RATE_LIMIT_TPM || '1000000', 10),
}));
