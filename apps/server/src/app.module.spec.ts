import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    const module = new AppModule();
    expect(module).toBeDefined();
  });
});
