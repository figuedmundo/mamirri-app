import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  UseGuards,
  HttpStatus,
  Param,
  Query,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AiAnalysisService } from './ai-analysis.service';
import { AnalyzeCaseDto } from './dto/analyze-case.dto';
import { AnalysisResultDto } from './dto/analysis-result.dto';
import { AnalyzeImageDto } from './dto/analyze-image.dto';
import { VisionAnalysisResultDto } from './dto/vision-analysis-result.dto';
import { SubmitFeedbackDto, FeedbackResponseDto } from './dto/feedback.dto';
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

  @Post('cases/:caseId/analyze')
  @ApiOperation({
    summary: 'Analyze clinical case with AI (Multi-modal)',
    description:
      'Analyzes a clinical case using RAG, vision findings, and voice notes to provide treatment suggestions.',
  })
  @ApiParam({ name: 'caseId', description: 'ID of the clinical case' })
  @ApiQuery({
    name: 'forceVision',
    required: false,
    type: Boolean,
    description: 'Whether to force fresh vision analysis of images',
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
  async analyzeCaseMultiModal(
    @Param('caseId') caseId: string,
    @CurrentTherapist() user: { userId: string },
    @Query('forceVision') forceVision?: string,
  ): Promise<AnalysisResultDto> {
    return this.aiAnalysisService.analyzeCase(
      caseId,
      user.userId,
      forceVision === 'true',
    );
  }

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze clinical case with AI (Legacy)',
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

  @Put('analyses/:analysisId/suggestions/:suggestionIndex/feedback')
  @ApiOperation({
    summary: 'Submit or update feedback for an AI suggestion',
    description:
      'Upserts Like/Dislike feedback for a specific suggestion in an analysis.',
  })
  @ApiParam({ name: 'analysisId', description: 'ID of the AI analysis' })
  @ApiParam({
    name: 'suggestionIndex',
    description: 'Index of the suggestion (0=primary)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback saved successfully',
    type: FeedbackResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Analysis not found',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' })
  async submitFeedback(
    @Param('analysisId') analysisId: string,
    @Param('suggestionIndex', ParseIntPipe) suggestionIndex: number,
    @Body() dto: SubmitFeedbackDto,
    @CurrentTherapist() user: { userId: string },
  ): Promise<FeedbackResponseDto> {
    return this.aiAnalysisService.submitFeedback(
      analysisId,
      suggestionIndex,
      dto.isPositive,
      dto.comment,
      user.userId,
    );
  }

  @Delete('analyses/:analysisId/suggestions/:suggestionIndex/feedback')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove feedback for an AI suggestion',
    description: 'Deletes existing feedback for a specific suggestion.',
  })
  @ApiParam({ name: 'analysisId', description: 'ID of the AI analysis' })
  @ApiParam({ name: 'suggestionIndex', description: 'Index of the suggestion' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Feedback removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Analysis not found',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' })
  async deleteFeedback(
    @Param('analysisId') analysisId: string,
    @Param('suggestionIndex', ParseIntPipe) suggestionIndex: number,
    @CurrentTherapist() user: { userId: string },
  ): Promise<void> {
    await this.aiAnalysisService.deleteFeedback(
      analysisId,
      suggestionIndex,
      user.userId,
    );
  }

  @Get('analyses/:analysisId/feedback')
  @ApiOperation({
    summary: 'Get all feedbacks for an AI analysis',
    description:
      'Returns all feedbacks submitted for suggestions in a given analysis.',
  })
  @ApiParam({ name: 'analysisId', description: 'ID of the AI analysis' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedbacks retrieved successfully',
    type: [FeedbackResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Analysis not found',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' })
  async getFeedbacks(
    @Param('analysisId') analysisId: string,
    @CurrentTherapist() user: { userId: string },
  ): Promise<FeedbackResponseDto[]> {
    return this.aiAnalysisService.getFeedbacks(analysisId, user.userId);
  }
}
