import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  lastPage: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty()
  meta: PaginationMetaDto;
}
