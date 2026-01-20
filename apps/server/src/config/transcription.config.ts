export default () => ({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.WHISPER_MODEL || 'whisper-large-v3',
  language: process.env.WHISPER_LANGUAGE || 'es',
  timeout: parseInt(process.env.WHISPER_TIMEOUT || '30000', 10),
  maxRetries: parseInt(process.env.WHISPER_MAX_RETRIES || '5', 10),
});
