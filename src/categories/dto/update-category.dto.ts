import { PartialType } from '@nestjs/mapped-types'; // Используем mapped-types для лучшей поддержки Swagger
import { CreateCategoryDto } from './create-category.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @ApiPropertyOptional({ example: 'Продукты', description: 'Название категории' })
    name?: string;

    @ApiPropertyOptional({
        example: '#FF5733',
        description: 'Цвет категории в формате HEX',
    })
    color?: string;
}