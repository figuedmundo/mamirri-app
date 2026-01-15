import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadFileDto, GetFileUrlDto } from './dto/upload-file.dto';

@ApiTags('storage')
@ApiBearerAuth()
@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file to storage' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or file too large',
  })
  @ApiResponse({ status: 500, description: 'Storage service error' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        path: {
          type: 'string',
        },
        metadata: {
          type: 'string',
        },
      },
    },
  })
  async uploadFile(
    @Body() body: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filePath = await this.storageService.uploadFile(
      file,
      body.path,
      body.metadata ? JSON.parse(body.metadata) : undefined,
    );
    return { path: filePath };
  }

  @Get('url/*path')
  @ApiOperation({ summary: 'Generate presigned URL for file download' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Failed to generate URL' })
  async getFileUrl(@Param('path') path: string, @Param() query: GetFileUrlDto) {
    const url = await this.storageService.getFileUrl(path, query.expiry);
    return { url };
  }

  @Delete('file/*path')
  @ApiOperation({ summary: 'Delete a file from storage' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete file' })
  async deleteFile(@Param('path') path: string) {
    await this.storageService.deleteFile(path);
    return { success: true };
  }

  @Get('exists/*path')
  @ApiOperation({ summary: 'Check if a file exists in storage' })
  @ApiResponse({ status: 200, description: 'File exists' })
  @ApiResponse({ status: 500, description: 'Failed to check file existence' })
  async fileExists(@Param('path') path: string) {
    const exists = await this.storageService.fileExists(path);
    return { exists };
  }
}
