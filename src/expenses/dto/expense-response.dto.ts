import { ApiProperty } from '@nestjs/swagger';
import { CategoryViewModel } from 'src/categories/dto/category-response.dto';

export class ExpenseViewModel {
    @ApiProperty({ example: 1, description: 'Уникальный идентификатор расхода' })
    id: number;

    @ApiProperty({ example: 5, description: 'ID дня бюджета' })
    budgetDayId: number;

    @ApiProperty({ type: () => CategoryViewModel, description: 'Категория расхода' })
    category: CategoryViewModel;

    @ApiProperty({ example: '-5000.00', description: 'Сумма расхода' })
    amount: string; // Используем string для decimal

    @ApiProperty({
        example: 'Зарплата за январь',
        description: 'Описание расхода',
        nullable: true,
    })
    description: string | null;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Дата и время создания расхода' })
    createdAt: Date;
}
