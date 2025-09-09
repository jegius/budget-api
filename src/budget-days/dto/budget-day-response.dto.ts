import { ApiProperty } from '@nestjs/swagger';
import { ExpenseViewModel } from 'src/expenses/dto/expense-response.dto';
import { CurrencyViewModel } from 'src/currencies/dto/currency-response.dto';

export class BudgetDayViewModel {
    @ApiProperty({ example: 1, description: 'Уникальный идентификатор дня бюджета' })
    id: number;

    @ApiProperty({ example: '2024-01-15', description: 'Дата дня бюджета' })
    date: string; // или Date

    @ApiProperty({ example: '150.75', description: 'Общая сумма расходов за день', type: String })
    totalSpent: string; // Используем string для decimal

    @ApiProperty({ type: () => CurrencyViewModel, description: 'Валюта бюджета' })
    currency: CurrencyViewModel;

    @ApiProperty({ type: () => [ExpenseViewModel], description: 'Список расходов за этот день' })
    expenses: ExpenseViewModel[];
}