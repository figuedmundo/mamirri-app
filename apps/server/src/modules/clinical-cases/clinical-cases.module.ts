import { Module } from '@nestjs/common';
import { ClinicalCasesController } from './clinical-cases.controller';
import { ClinicalCasesService } from './clinical-cases.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClinicalCasesController],
  providers: [ClinicalCasesService],
  exports: [ClinicalCasesService],
})
export class ClinicalCasesModule {}
