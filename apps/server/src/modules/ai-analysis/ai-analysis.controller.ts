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
import { AnalyzeImageDto } from './dto/analyze-image.dto';
import { VisionAnalysisResultDto } from './dto/vision-analysis-result.dto';
import { VisionService } from './services/vision.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from '../patients/decorators/current-therapist.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiAnalysisController {
  constructor(
    private readonly aiAnalysisService: AiAnalysisService,
    private readonly visionService: VisionService,
  ) {}

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

  @Post('vision/analyze')
  @ApiOperation({
    summary: 'Analyze clinical image with AI vision',
    description:
      'Analyzes a posturogram or footprint image using Gemini Vision API and returns structured clinical findings.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image analysis completed successfully',
    type: VisionAnalysisResultDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Image not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this patient',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid image type',
  })
  async analyzeImage(
    @Body() analyzeImageDto: AnalyzeImageDto,
    @CurrentTherapist() user: { userId: string },
  ): Promise<VisionAnalysisResultDto> {
    return this.visionService.analyzeImageById(
      analyzeImageDto.imageId,
      analyzeImageDto.imageType,
      user.userId,
    );
  }
}
