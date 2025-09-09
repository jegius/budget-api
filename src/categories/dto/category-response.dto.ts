import { ApiProperty } from '@nestjs/swagger';

export class CategoryViewModel {
    @ApiProperty({ example: 1, description: 'Уникальный идентификатор категории' })
    id: number;

    @ApiProperty({ example: 'Продукты', description: 'Название категории' })
    name: string;

    @ApiProperty({ example: '#FF5733', description: 'Цвет категории в формате HEX' })
    color: string;
}
