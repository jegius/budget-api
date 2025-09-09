import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({ example: 'John Doe', description: 'Полное имя', required: false, nullable: true })
    @IsOptional()
    @IsString()
    fullName?: string | null;

    @ApiProperty({
        example: 'https://example.com/avatar.jpg',
        description: 'URL аватара',
        required: false,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    avatarUrl?: string | null;

    @ApiProperty({ example: 'Люблю путешествовать и готовить', description: 'Биография', required: false, nullable: true })
    @IsOptional()
    @IsString()
    bio?: string | null;

    @ApiProperty({ example: 1, description: 'ID валюты по умолчанию', required: false })
    @IsOptional()
    @IsInt()
    defaultCurrencyId?: number;
}