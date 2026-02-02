import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { LogsController } from './logs.controller';
import { LogLevel } from '@mamirri/logger';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [LogsController],
  providers: [
    {
      provide: LoggerService,
      useFactory: (configService: ConfigService) => {
        const levelStr = configService.get<string>('LOG_LEVEL', 'info');
        const level = LogLevel.fromString(levelStr);

        return new LoggerService({
          level,
          format: configService.get('LOG_FORMAT', 'json'),
          output: configService.get('LOG_OUTPUT', 'stdout'),
          serviceName: configService.get('SERVICE_NAME', 'mamirri-server'),
          version: configService.get('VERSION', '0.0.1'),
          environment: configService.get('NODE_ENV', 'development'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
