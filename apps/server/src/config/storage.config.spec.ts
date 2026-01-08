import storageConfig from './storage.config';

describe('StorageConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load configuration from environment variables', () => {
    process.env.MINIO_ENDPOINT = 'minio.example.com';
    process.env.MINIO_PORT = '9000';
    process.env.MINIO_ACCESS_KEY = 'test-access-key';
    process.env.MINIO_SECRET_KEY = 'test-secret-key';
    process.env.MINIO_USE_SSL = 'true';
    process.env.MINIO_BUCKET = 'test-bucket';

    const config = storageConfig();

    expect(config.endpoint).toBe('minio.example.com');
    expect(config.port).toBe('9000');
    expect(config.accessKey).toBe('test-access-key');
    expect(config.secretKey).toBe('test-secret-key');
    expect(config.useSSL).toBe(true);
    expect(config.bucket).toBe('test-bucket');
  });

  it('should apply default values when env vars are missing', () => {
    delete process.env.MINIO_ENDPOINT;
    delete process.env.MINIO_PORT;
    delete process.env.MINIO_ACCESS_KEY;
    delete process.env.MINIO_SECRET_KEY;
    delete process.env.MINIO_USE_SSL;
    delete process.env.MINIO_BUCKET;

    const config = storageConfig();

    expect(config.endpoint).toBe('localhost');
    expect(config.port).toBe('9000');
    expect(config.useSSL).toBe(false);
    expect(config.bucket).toBe('physio-media');
  });

  it('should handle partial environment configuration', () => {
    process.env.MINIO_ENDPOINT = 'custom.minio.com';
    process.env.MINIO_BUCKET = 'custom-bucket';

    const config = storageConfig();

    expect(config.endpoint).toBe('custom.minio.com');
    expect(config.bucket).toBe('custom-bucket');
    expect(config.port).toBe('9000');
    expect(config.useSSL).toBe(false);
  });

  it('should parse SSL flag correctly from string', () => {
    process.env.MINIO_USE_SSL = 'true';
    const config1 = storageConfig();
    expect(config1.useSSL).toBe(true);

    process.env.MINIO_USE_SSL = 'false';
    const config2 = storageConfig();
    expect(config2.useSSL).toBe(false);
  });
});
