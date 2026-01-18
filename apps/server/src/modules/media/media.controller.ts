import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from '../patients/decorators/current-therapist.decorator';
import { MediaService } from './media.service';
import { UploadFootprintDto } from './dto/upload-footprint.dto';
import { UploadPostureVideoDto } from './dto/upload-posture-video.dto';
import { UploadVoiceNoteDto } from './dto/upload-voice-note.dto';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('patients/:patientId/photos')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a patient photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Photo uploaded successfully',
  })
  async uploadPatientPhoto(
    @Param('patientId') patientId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentTherapist() user: any,
  ) {
    return this.mediaService.uploadPatientPhoto(patientId, file, user.userId);
  }

  @Post('evaluations/:evaluationId/footprints')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a footprint image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['initial', 'final', 'followup'],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Footprint uploaded and created successfully',
  })
  async uploadFootprint(
    @Param('evaluationId') evaluationId: string,
    @Body() dto: UploadFootprintDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentTherapist() user: any,
  ) {
    return this.mediaService.uploadFootprint(
      evaluationId,
      file,
      dto.type,
      user.userId,
    );
  }

  @Post('evaluations/:evaluationId/posture-videos')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a posture video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['gait', 'static', 'dynamic'],
        },
        duration: {
          type: 'integer',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Video uploaded and created successfully',
  })
  async uploadPostureVideo(
    @Param('evaluationId') evaluationId: string,
    @Body() dto: UploadPostureVideoDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentTherapist() user: any,
  ) {
    return this.mediaService.uploadPostureVideo(
      evaluationId,
      file,
      dto.type,
      dto.duration,
      user.userId,
    );
  }

  @Post('evaluations/:evaluationId/voice-notes')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a voice note for an evaluation' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        durationSeconds: {
          type: 'integer',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Voice note uploaded and appended successfully',
  })
  async uploadEvaluationVoiceNote(
    @Param('evaluationId') evaluationId: string,
    @Body() dto: UploadVoiceNoteDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentTherapist() user: any,
  ) {
    return this.mediaService.uploadVoiceNote(
      'evaluation',
      evaluationId,
      file,
      dto.durationSeconds,
      user.userId,
    );
  }

  @Post('sessions/:sessionId/voice-notes')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a voice note for a session' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        durationSeconds: {
          type: 'integer',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Voice note uploaded and appended successfully',
  })
  async uploadSessionVoiceNote(
    @Param('sessionId') sessionId: string,
    @Body() dto: UploadVoiceNoteDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentTherapist() user: any,
  ) {
    return this.mediaService.uploadVoiceNote(
      'session',
      sessionId,
      file,
      dto.durationSeconds,
      user.userId,
    );
  }
}
