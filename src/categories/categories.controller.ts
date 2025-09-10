import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post, Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { ApiPaginatedResponse } from 'src/common/swagger/paginated-api-response.decorator';
import { CurrencyViewModel } from 'src/currencies/dto/currency-response.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryViewModel } from './dto/category-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly service: CategoriesService) {}

    @Post()
    @ApiOperation({ summary: 'Создать новую категорию' })
    @ApiResponse({ status: 201, description: 'Категория успешно создана.', type: CategoryViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для создания категории.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    create(
        @CurrentUser() user,
        @Body() dto: CreateCategoryDto,
    ): Promise<CategoryViewModel> {
        return this.service.create(user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Получить список своих категорий' })
    @ApiPaginatedResponse(CurrencyViewModel)
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице', example: 10 })
    findAll(
        @CurrentUser() user,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponseDto<CategoryViewModel>> {
        return this.service.findAllByUser(user.userId, page, limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить категорию по ID' })
    @ApiResponse({ status: 200, description: 'Информация о категории.', type: CategoryViewModel })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Категория не найдена.' })
    findOne(
        @CurrentUser() user,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<CategoryViewModel> {
        return this.service.findOne(user.userId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить категорию' })
    @ApiResponse({ status: 200, description: 'Категория успешно обновлена.', type: CategoryViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для обновления категории.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Категория не найдена.' })
    update(
        @CurrentUser() user,
        @Param('id', ParseIntPipe) id: number,
        @Body() patch: UpdateCategoryDto,
    ): Promise<CategoryViewModel> {
        return this.service.update(user.userId, id, patch);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить категорию' })
    @ApiResponse({ status: 200, description: 'Категория успешно удалена.', type: Object })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Категория не найдена.' })
    remove(
        @CurrentUser() user,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ success: boolean }> {
        return this.service.remove(user.userId, id);
    }
}