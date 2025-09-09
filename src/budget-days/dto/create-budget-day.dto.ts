import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class CreateBudgetDayDto {
    @ApiProperty({ example: 1, description: 'ID бюджета, к которому относится день' })
    @IsInt()
    budgetId: number;

    @ApiProperty({ example: '2024-05-23', description: 'Дата дня бюджета в формате YYYY-MM-DD' })
    @IsDateString()
    date: string;
}