import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserViewModel } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly service: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Получить список всех пользователей (для администраторов)' })
    @ApiResponse({ status: 200, description: 'Список пользователей.', type: [UserViewModel] })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен.' })
    findAll(): Promise<UserViewModel[]> {
        // TODO: Добавить проверку роли администратора
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить пользователя по ID' })
    @ApiResponse({ status: 200, description: 'Информация о пользователе.', type: UserViewModel })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен.' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
    findOne(
        @CurrentUser() currentUser,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<UserViewModel> {
        // TODO: Добавить проверку роли администратора или что id == currentUser.userId
        return this.service.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить пользователя (только свои данные или администратор)' })
    @ApiResponse({ status: 200, description: 'Пользователь успешно обновлен.', type: UserViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для обновления пользователя.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен.' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
    update(
        @CurrentUser() currentUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() patch: UpdateUserDto,
    ): Promise<UserViewModel> {
        return this.service.update(id, patch, currentUser.userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить пользователя (только себя или администратор)' })
    @ApiResponse({ status: 200, description: 'Пользователь успешно удален.', type: Object })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен.' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
    remove(
        @CurrentUser() currentUser,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ success: boolean }> {
        return this.service.remove(id, currentUser.userId);
    }
}
