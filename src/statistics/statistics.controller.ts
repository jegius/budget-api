import { Controller, Get, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
    @ApiResponse({ status: 200, description: 'Статистика расходов по дням.', type: [ExpenseByDayViewModel] })
    @ApiResponse({ status: 400, description: 'Неверные параметры запроса (год или месяц).' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден или у него нет бюджетов.' })
    getExpensesByDay(
        @CurrentUser() user,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month: number,
    ): Promise<ExpenseByDayViewModel[]> {
        return this.service.getExpensesByDay(user.userId, year, month);
    }

    @Get('category-stats')
    @ApiOperation({ summary: 'Получить статистику по категориям за указанный месяц' })
    @ApiQuery({ name: 'year', required: true, type: Number, description: 'Год (например, 2024)' })
    @ApiQuery({ name: 'month', required: true, type: Number, description: 'Месяц (1-12)' })
    @ApiResponse({ status: 200, description: 'Статистика по категориям.', type: [CategoryStatsViewModel] })
    @ApiResponse({ status: 400, description: 'Неверные параметры запроса (год или месяц).' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден или у него нет бюджетов.' })
    getCategoryStats(
        @CurrentUser() user,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month: number,
    ): Promise<CategoryStatsViewModel[]> {
        return this.service.getCategoryStats(user.userId, year, month);
    }
}