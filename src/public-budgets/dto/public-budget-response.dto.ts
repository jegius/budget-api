// src/public-budgets/dto/public-budget-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyViewModel } from 'src/currencies/dto/currency-response.dto';

export class PublicBudgetViewModel {
    @ApiProperty({ example: 10, description: 'ID бюджета' })
    budgetId: number;

    @ApiProperty({ example: 'john_doe', description: 'Имя пользователя, поделившегося бюджетом' })
    userName: string;

    @ApiProperty({ example: 'Мой семейный бюджет', description: 'Название бюджета' })
    budgetName: string;

    @ApiProperty({ type: () => CurrencyViewModel, description: 'Валюта бюджета' })
    currency: CurrencyViewModel;

    @ApiProperty({ example: '2024-01-20T10:30:00.000Z', description: 'Дата и время публикации бюджета' })
    sharedAt: Date;

    @ApiProperty({ example: '2500.50', description: 'Общая сумма расходов в бюджете' })
    totalSpent: string; // Используем string для decimal
}
