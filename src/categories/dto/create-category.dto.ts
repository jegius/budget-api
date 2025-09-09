import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, IsOptional } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Продукты', description: 'Название категории' })
    @IsString()
    @Length(1, 100)
    name: string;

    @ApiProperty({
        example: '#FF5733',
        description: 'Цвет категории в формате HEX',
        default: '#000000',
        required: false,
    })
    @IsString()
    @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Неверный формат цвета HEX' })
    @IsOptional()
    color?: string;
}