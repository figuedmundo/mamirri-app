import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [AuthModule, PatientsModule, SessionsModule, MediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
