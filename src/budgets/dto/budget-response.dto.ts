// src/budgets/dto/budget-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyViewModel } from 'src/currencies/dto/currency-response.dto';

export class BudgetViewModel {
    @ApiProperty({ example: 1, description: 'Уникальный идентификатор бюджета' })
    id: number;

    @ApiProperty({ example: 'Мой семейный бюджет', description: 'Название бюджета' })
    name: string;

    @ApiProperty({ type: () => CurrencyViewModel, description: 'Валюта бюджета' })
    currency: CurrencyViewModel;

    @ApiProperty({ example: false, description: 'Является ли бюджет публичным' })
    isPublic: boolean;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Дата и время создания бюджета' })
    createdAt: Date;
}
