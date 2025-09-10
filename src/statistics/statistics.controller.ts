import { Controller, Get, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { ApiPaginatedResponse } from 'src/common/swagger/paginated-api-response.decorator';
import { StatisticsService } from './statistics.service';
import { ExpenseByDayViewModel } from './dto/expense-by-day-response.dto';
import { CategoryStatsViewModel } from './dto/category-stats-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly service: StatisticsService) {}

    @Get('expenses-by-day')
    @ApiOperation({ summary: 'Получить статистику расходов по дням за указанный месяц' })
    @ApiQuery({ name: 'year', required: true, type: Number, description: 'Год (например, 2024)' })
    @ApiQuery({ name: 'month', required: true, type: Number, description: 'Месяц (1-12)' })
    @ApiPaginatedResponse(ExpenseByDayViewModel)
    @ApiResponse({ status: 400, description: 'Неверные параметры запроса (год или месяц).' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден или у него нет бюджетов.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество дней на странице', example: 10 })
    getExpensesByDay(
        @CurrentUser() user,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponseDto<ExpenseByDayViewModel>> {
        return this.service.getExpensesByDay(user.userId, year, month, page, limit);
    }

    @Get('category-stats')
    @ApiOperation({ summary: 'Получить статистику по категориям за указанный месяц' })
    @ApiQuery({ name: 'year', required: true, type: Number, description: 'Год (например, 2024)' })
    @ApiQuery({ name: 'month', required: true, type: Number, description: 'Месяц (1-12)' })
    @ApiPaginatedResponse(CategoryStatsViewModel)
    @ApiResponse({ status: 400, description: 'Неверные параметры запроса (год или месяц).' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден или у него нет бюджетов.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество категорий на странице', example: 10 })
    getCategoryStats(
        @CurrentUser() user,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponseDto<CategoryStatsViewModel>> {
        return this.service.getCategoryStats(user.userId, year, month, page, limit);
    }
}