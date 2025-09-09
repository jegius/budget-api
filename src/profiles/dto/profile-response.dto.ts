import { ApiProperty } from '@nestjs/swagger';
import { CurrencyViewModel } from 'src/currencies/dto/currency-response.dto';
import { BudgetViewModel } from '../../budgets/dto/budget-response.dto';

export class ProfileViewModel {
    @ApiProperty({ example: 1, description: 'ID пользователя, которому принадлежит профиль' })
    userId: number;

    @ApiProperty({ example: 'John Doe', description: 'Полное имя', required: false, nullable: true })
    fullName: string | null;

    @ApiProperty({
        example: 'https://example.com/avatar.jpg',
        description: 'URL аватара',
        required: false,
        nullable: true,
    })
    avatarUrl: string | null;

    @ApiProperty({ example: 'Люблю путешествовать и готовить', description: 'Биография', required: false, nullable: true })
    bio: string | null;

    @ApiProperty({
        type: () => CurrencyViewModel,
        description: 'Валюта по умолчанию пользователя',
        nullable: true,
    })
    defaultCurrency: CurrencyViewModel | null;

    @ApiProperty({ example: '1250.75', description: 'Общая сумма расходов пользователя' })
    totalSpent: string; // Используем string для decimal

    @ApiProperty({ type: () => [BudgetViewModel], description: 'Список бюджетов пользователя' })
    budgets: BudgetViewModel[];
}
