import { Test, type TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';

describe('AuthModule Infrastructure', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue({})
      .compile();
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should compile the module', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should provide AuthService', () => {
    const service = moduleRef.get<AuthService>(AuthService);
    expect(service).toBeDefined();
  });

  it('should provide AuthController', () => {
    const controller = moduleRef.get<AuthController>(AuthController);
    expect(controller).toBeDefined();
  });
});
