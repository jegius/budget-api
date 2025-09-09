import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from 'src/auth/dto/register.dto'; // Используем поля из RegisterDto

export class UpdateUserDto extends PartialType(RegisterDto) {
}
