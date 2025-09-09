import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
    @ApiProperty({ example: 5, description: 'ID дня бюджета, к которому относится расход' })
    @IsInt()
    budgetDayId: number;

    @ApiProperty({ example: 3, description: 'ID категории расхода' })
    @IsInt()
    categoryId: number;

    @ApiProperty({
        example: '-5000.00',
        description: 'Сумма расхода. Может быть отрицательной для доходов.',
    })
    @IsNumberString({}, { message: 'Сумма должна быть числом в виде строки' })
    amount: string;

    @ApiProperty({
        example: 'Зарплата за январь',
        description: 'Описание расхода или дохода',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
