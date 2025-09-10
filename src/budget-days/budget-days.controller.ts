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
import { BudgetDaysService } from './budget-days.service';
import { BudgetDayViewModel } from './dto/budget-day-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateBudgetDayDto } from './dto/create-budget-day.dto';
import { UpdateBudgetDayDto } from './dto/update-budget-day.dto';

@ApiTags('budget-days')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budget-days')
export class BudgetDaysController {
    constructor(private readonly service: BudgetDaysService) {}

    @Post()
    @ApiOperation({ summary: 'Создать новый день бюджета' })
    @ApiResponse({ status: 201, description: 'День бюджета успешно создан.', type: BudgetDayViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для создания дня бюджета.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    async create(@Body() dto: CreateBudgetDayDto): Promise<BudgetDayViewModel> {
        return this.service.create(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить день бюджета по ID со списком расходов' })
    @ApiResponse({ status: 200, description: 'Информация о дне бюджета.', type: BudgetDayViewModel })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'День бюджета не найден.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<BudgetDayViewModel> {
        return this.service.findOne(id);
    }

    @Get('budget/:budgetId')
    @ApiOperation({ summary: 'Получить список дней бюджета по ID бюджета' })
    @ApiPaginatedResponse(CurrencyViewModel)
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Бюджет не найден.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице', example: 10 })
    async findByBudget(
        @Param('budgetId', ParseIntPipe) budgetId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponseDto<BudgetDayViewModel>> {
        return this.service.findByBudget(budgetId, page, limit);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить день бюджета (например, дату)' })
    @ApiResponse({ status: 200, description: 'День бюджета успешно обновлен.', type: BudgetDayViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для обновления дня бюджета.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'День бюджета не найден.' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() patch: UpdateBudgetDayDto,
    ): Promise<BudgetDayViewModel> {
        return this.service.update(id, patch);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить день бюджета' })
    @ApiResponse({ status: 200, description: 'День бюджета успешно удален.', type: Object })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'День бюджета не найден.' })
    remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
        return this.service.remove(id);
    }
}