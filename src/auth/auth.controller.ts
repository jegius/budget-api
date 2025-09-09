import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

class AuthResponse {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    access_token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован.', type: AuthResponse })
    @ApiResponse({ status: 400, description: 'Неверные данные для регистрации.' })
    async register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Вход пользователя' })
    @ApiResponse({ status: 200, description: 'Успешный вход.', type: AuthResponse })
    @ApiResponse({ status: 401, description: 'Неверные учетные данные.' })
    async login(@Body() dto: LoginDto) {
        const user = await this.auth.validate(dto.usernameOrEmail, dto.password);
        return this.auth.sign(user);
    }
}
