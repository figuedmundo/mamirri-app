import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const connectionString = PrismaService.getConnectionString(configService);

    const logger = new Logger(PrismaService.name);
    logger.log(
      `Constructed Connection String: ${connectionString.replace(/:[^:@]+@/, ':****@')}`,
    );

    const pool = new Pool({
      connectionString,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  private static getConnectionString(configService: ConfigService): string {
    const url = configService.get<string>('DATABASE_URL');

    if (url && url.includes('${')) {
      return url
        .replace('${POSTGRES_USER}', configService.get('POSTGRES_USER') || '')
        .replace(
          '${POSTGRES_PASSWORD}',
          configService.get('POSTGRES_PASSWORD') || '',
        )
        .replace(
          '${POSTGRES_PORT}',
          configService.get('POSTGRES_PORT') || '5432',
        )
        .replace('${POSTGRES_DB}', configService.get('POSTGRES_DB') || '');
    }

    if (url) return url;

    const user = configService.get('POSTGRES_USER');
    const pass = configService.get('POSTGRES_PASSWORD');
    const host = configService.get('POSTGRES_HOST') || 'localhost';
    const port = configService.get('POSTGRES_PORT') || '5432';
    const db = configService.get('POSTGRES_DB');

    if (!user || !pass || !db) {
      if (process.env.NODE_ENV === 'test') {
        return `postgresql://postgres:postgres@localhost:${port}/physio_test`;
      }
      throw new Error(
        'Database configuration missing: POSTGRES_USER, POSTGRES_PASSWORD, or POSTGRES_DB not found in environment.',
      );
    }

    return `postgresql://${user}:${pass}@${host}:${port}/${db}`;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
