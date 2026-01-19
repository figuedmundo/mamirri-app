import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { ClinicalCasesModule } from './modules/clinical-cases/clinical-cases.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { MediaModule } from './modules/media/media.module';
import { TreatmentPlansModule } from './modules/treatment-plans/treatment-plans.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    PatientsModule,
    ClinicalCasesModule,
    SessionsModule,
    MediaModule,
    TreatmentPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
