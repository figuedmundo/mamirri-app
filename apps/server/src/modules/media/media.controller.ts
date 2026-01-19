import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from '../patients/decorators/current-therapist.decorator';
import { MediaService } from './media.service';
import { SessionPhotoService } from './services/session-photo.service';
import { UploadFootprintDto } from './dto/upload-footprint.dto';
import { UploadPostureVideoDto } from './dto/upload-posture-video.dto';
import { UploadVoiceNoteDto } from './dto/upload-voice-note.dto';
import { UploadSessionPhotoDto } from './dto/upload-session-photo.dto';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly sessionPhotoService: SessionPhotoService,
  ) {}

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

  // ============================================================================
  // Session Photos
  // ============================================================================

  @Post('sessions/:sessionId/photos')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a photo for a treatment session' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'sessionId', description: 'Treatment session ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Photo file (JPEG/PNG)',
        },
        caption: {
          type: 'string',
          maxLength: 140,
          description: 'Optional caption for the photo',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Photo uploaded successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - session belongs to another therapist',
  })
  async uploadSessionPhoto(
    @Param('sessionId') sessionId: string,
    @Body() dto: UploadSessionPhotoDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentTherapist() user: any,
  ) {
    return this.sessionPhotoService.uploadPhoto(
      sessionId,
      file,
      user.userId,
      dto.caption,
    );
  }

  @Get('sessions/:sessionId/photos')
  @ApiOperation({ summary: 'List all photos for a treatment session' })
  @ApiParam({ name: 'sessionId', description: 'Treatment session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of session photos with signed URLs',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - session belongs to another therapist',
  })
  async getSessionPhotos(
    @Param('sessionId') sessionId: string,
    @CurrentTherapist() user: any,
  ) {
    return this.sessionPhotoService.getPhotos(sessionId, user.userId);
  }

  @Delete('sessions/:sessionId/photos/:photoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a photo from a treatment session' })
  @ApiParam({ name: 'sessionId', description: 'Treatment session ID' })
  @ApiParam({ name: 'photoId', description: 'Photo ID to delete' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Photo deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session or photo not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - session belongs to another therapist',
  })
  async deleteSessionPhoto(
    @Param('sessionId') sessionId: string,
    @Param('photoId') photoId: string,
    @CurrentTherapist() user: any,
  ) {
    await this.sessionPhotoService.deletePhoto(sessionId, photoId, user.userId);
  }
}
