import { ApiProperty } from '@nestjs/swagger';
import { CurrencyViewModel } from 'src/currencies/dto/currency-response.dto';

class ExpenseByDayItem {
    @ApiProperty({ example: 5, description: 'ID расхода' })
    id: number;

    @ApiProperty({ example: 'Продукты', description: 'Название категории расхода' })
    category: string;

    @ApiProperty({ example: '75.25', description: 'Сумма расхода' })
    amount: string; // Используем string для decimal

    @ApiProperty({ example: 'Молоко, хлеб', description: 'Описание расхода', nullable: true })
    description: string | null;
}

export class ExpenseByDayViewModel {
    @ApiProperty({ example: '2024-01-15', description: 'Дата' })
    date: string; // или Date

    @ApiProperty({ example: '150.75', description: 'Общая сумма расходов за день' })
    totalSpent: string; // Используем string для decimal

    @ApiProperty({ type: () => CurrencyViewModel, description: 'Валюта' })
    currency: CurrencyViewModel;

    @ApiProperty({ type: () => [ExpenseByDayItem], description: 'Список расходов за день' })
    expenses: ExpenseByDayItem[];
}
