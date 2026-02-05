import { Controller, Post, Body, UseGuards, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiAnalysisService } from './ai-analysis.service';
import { AnalyzeCaseDto } from './dto/analyze-case.dto';
import { AnalysisResultDto } from './dto/analysis-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from '../patients/decorators/current-therapist.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze clinical case with AI',
    description:
      'Analyzes a clinical case using RAG over medical literature and returns treatment suggestions with citations.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analysis completed successfully',
    type: AnalysisResultDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Clinical case not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this clinical case',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async analyzeCase(
    @Body() analyzeCaseDto: AnalyzeCaseDto,
    @CurrentTherapist() user: { userId: string },
  ): Promise<AnalysisResultDto> {
    return this.aiAnalysisService.analyzeCase(
      analyzeCaseDto.clinicalCaseId,
      user.userId,
    );
  }
}
