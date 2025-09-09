import { ApiProperty } from '@nestjs/swagger';
import { CurrencyViewModel } from 'src/currencies/dto/currency-response.dto';

export class UserViewModel {
    @ApiProperty({ example: 1, description: 'Уникальный идентификатор пользователя' })
    id: number;

    @ApiProperty({ example: 'john_doe', description: 'Имя пользователя' })
    username: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'Email пользователя' })
    email: string;

    @ApiProperty({
        type: () => CurrencyViewModel,
        description: 'Валюта по умолчанию пользователя',
        nullable: true,
    })
    defaultCurrency: CurrencyViewModel | null;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Дата и время создания пользователя' })
    createdAt: Date;
}