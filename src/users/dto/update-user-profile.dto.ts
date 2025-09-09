import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserProfileDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @Length(3, 50)
    username?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    defaultCurrencyId?: number;
}