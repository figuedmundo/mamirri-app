import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';

describe('AuthModule Infrastructure', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue({})
      .compile();
  });

  it('should compile the module', async () => {
    expect(moduleRef).toBeDefined();
  });

  it('should provide AuthService', async () => {
    const service = moduleRef.get<AuthService>(AuthService);
    expect(service).toBeDefined();
  });

  it('should provide AuthController', async () => {
    const controller = moduleRef.get<AuthController>(AuthController);
    expect(controller).toBeDefined();
  });
});
