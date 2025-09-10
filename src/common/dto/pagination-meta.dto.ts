import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
    @ApiProperty({ example: 1, description: 'Текущая страница' })
    page: number;

    @ApiProperty({ example: 10, description: 'Количество элементов на странице' })
    limit: number;

    @ApiProperty({ example: 50, description: 'Общее количество элементов' })
    totalItems: number;

    @ApiProperty({ example: 5, description: 'Общее количество страниц' })
    totalPages: number;

    @ApiProperty({ example: true, description: 'Есть ли следующая страница' })
    hasNextPage: boolean;

    @ApiProperty({ example: false, description: 'Есть ли предыдущая страница' })
    hasPreviousPage: boolean;
}