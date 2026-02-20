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
import { UsersModule } from './modules/users/users.module';
import { LoggerModule } from './common/logger/logger.module';
import { AiAnalysisModule } from './modules/ai-analysis/ai-analysis.module';
import { LibraryModule } from './modules/library/library.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ScheduleModule } from '@nestjs/schedule';
import transcriptionConfig from './config/transcription.config';
import voyageConfig from './config/voyage.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      load: [transcriptionConfig, voyageConfig],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    PatientsModule,
    ClinicalCasesModule,
    SessionsModule,
    MediaModule,
    TreatmentPlansModule,
    UsersModule,
    LoggerModule,
    AiAnalysisModule,
    LibraryModule,
    ClinicsModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
