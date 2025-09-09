import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateBudgetDto {
    @ApiProperty({ example: 'Мой семейный бюджет', description: 'Название бюджета' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 1, description: 'ID валюты бюджета' })
    @IsInt()
    currencyId: number;

    @ApiProperty({ example: false, description: 'Является ли бюджет публичным', default: false })
    @IsBoolean()
    isPublic: boolean;
}
