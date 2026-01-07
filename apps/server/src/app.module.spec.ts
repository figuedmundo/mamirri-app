import { describe, it, expect } from '@jest/globals';
import { AppModule } from './app.module';

describe('AppModule Registration', () => {
  it('should import AuthModule', () => {
    const module = new AppModule();
    expect(module.imports).toContain('AuthModule');
  });

  it('should import PatientsModule', () => {
    const module = new AppModule();
    expect(module.imports).toContain('PatientsModule');
  });

  it('should import SessionsModule', () => {
    const module = new AppModule();
    expect(module.imports).toContain('SessionsModule');
  });

  it('should import MediaModule', () => {
    const module = new AppModule();
    expect(module.imports).toContain('MediaModule');
  });
});
