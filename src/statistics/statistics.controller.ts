import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
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
    @ApiOperation({ summary: 'Получить статистику расходов по дням' })
    @ApiResponse({ status: 200, description: 'Статистика расходов по дням.', type: [ExpenseByDayViewModel] })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    getExpensesByDay(@CurrentUser() user): Promise<ExpenseByDayViewModel[]> {
        return this.service.getExpensesByDay(user.userId);
    }

    @Get('category-stats')
    @ApiOperation({ summary: 'Получить статистику по категориям' })
    @ApiResponse({ status: 200, description: 'Статистика по категориям.', type: [CategoryStatsViewModel] })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    getCategoryStats(@CurrentUser() user): Promise<CategoryStatsViewModel[]> {
        return this.service.getCategoryStats(user.userId);
    }
}