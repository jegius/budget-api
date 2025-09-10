import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';

export class PaginatedResponseDto<T> {
    @ApiProperty({ isArray: true, description: 'Массив данных' })
    data: T[];

    @ApiProperty({ type: () => PaginationMetaDto, description: 'Метаданные пагинации' })
    meta: PaginationMetaDto;
}