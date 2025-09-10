import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch, Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { ApiPaginatedResponse } from 'src/common/swagger/paginated-api-response.decorator';
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
    @ApiPaginatedResponse(UserViewModel)
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице', example: 10 })
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponseDto<UserViewModel>> {
        return this.service.findAll(page, limit);
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
