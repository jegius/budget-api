import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class RegisterDto {
    @ApiProperty() @IsString() @Length(3, 50) username: string;
    @ApiProperty() @IsEmail() email: string;
    @ApiProperty() @IsString() @Length(6, 200) password: string;
    @ApiProperty({ required: false }) @IsOptional() defaultCurrencyId?: number;
}
