import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCurrencyDto {
    @ApiProperty() @IsString() @Length(3,3) code: string;
    @ApiProperty() @IsString() @Length(1,50) name: string;
    @ApiProperty() @IsString() @Length(1,10) symbol: string;
}
