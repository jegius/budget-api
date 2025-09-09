// src/statistics/dto/category-stats-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyViewModel } from 'src/currencies/dto/currency-response.dto';

export class CategoryStatsViewModel {
    @ApiProperty({ example: 'Продукты', description: 'Название категории' })
    category: string;

    @ApiProperty({ example: '320.50', description: 'Общая сумма расходов по категории' })
    totalSpent: string; // Используем string для decimal

    @ApiProperty({ type: () => CurrencyViewModel, description: 'Валюта' })
    currency: CurrencyViewModel;

    @ApiProperty({ example: 15, description: 'Количество расходов в этой категории' })
    count: number;
}
