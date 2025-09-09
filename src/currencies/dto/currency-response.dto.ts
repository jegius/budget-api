import { ApiProperty } from '@nestjs/swagger';

export class CurrencyViewModel {
    @ApiProperty({ example: 1, description: 'Уникальный идентификатор валюты' })
    id: number;

    @ApiProperty({ example: 'USD', description: 'Код валюты (ISO 4217)' })
    code: string;

    @ApiProperty({ example: 'US Dollar', description: 'Полное название валюты' })
    name: string;

    @ApiProperty({ example: '$', description: 'Символ валюты' })
    symbol: string;
}
