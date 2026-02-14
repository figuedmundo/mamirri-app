import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { SearchLibraryDto } from './dto/search-library.dto';
import { AddProtocolToPlanDto } from './dto/add-protocol-to-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTherapist } from '../patients/decorators/current-therapist.decorator';

@ApiTags('library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List all clinical categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of categories.' })
  async findAllCategories() {
    return this.libraryService.findAllCategories();
  }

  @Get('protocols')
  @ApiOperation({ summary: 'List or search protocols' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of protocols.' })
  async findProtocols(@Query() dto: SearchLibraryDto) {
    if (dto.q) {
      return this.libraryService.search(dto.q);
    }
    return this.libraryService.findAllProtocols(dto.categoryId);
  }

  @Get('protocols/:id')
  @ApiOperation({ summary: 'Get protocol details with references' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Protocol details.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Protocol not found.',
  })
  async findOneProtocol(@Param('id') id: string) {
    return this.libraryService.findOneProtocol(id);
  }

  @Get('references')
  @ApiOperation({ summary: 'List all bibliographic references' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of references.' })
  async findAllReferences() {
    return this.libraryService.findAllReferences();
  }

  @Post('treatment-plans/:planId/protocols')
  @ApiOperation({ summary: 'Add a protocol to a treatment plan' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Protocol added to treatment plan.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Treatment plan or protocol not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Protocol already added to this treatment plan.',
  })
  async addProtocolToPlan(
    @Param('planId') planId: string,
    @Body() dto: AddProtocolToPlanDto,
    @CurrentTherapist() user: { userId: string },
  ) {
    return this.libraryService.addProtocolToPlan(
      planId,
      dto.protocolId,
      user.userId,
      dto.notes,
    );
  }
}
