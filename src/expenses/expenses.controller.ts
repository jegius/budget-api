import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { toExpenseViewModel } from 'src/expenses/utils';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseViewModel } from './dto/expense-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';


@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
    constructor(private readonly service: ExpensesService) {}

    @Post()
    @ApiOperation({ summary: 'Создать новый расход' })
    @ApiResponse({ status: 201, description: 'Расход успешно создан.', type: ExpenseViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для создания расхода.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    async create(@Body() dto: CreateExpenseDto): Promise<ExpenseViewModel> {
        const expense = await this.service.create(dto);
        return toExpenseViewModel(expense);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить расход по ID' })
    @ApiResponse({ status: 200, description: 'Информация о расходе.', type: ExpenseViewModel })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Расход не найден.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ExpenseViewModel> {
        const expense = await this.service.findOne(id);
        return toExpenseViewModel(expense);
    }

    @Get('by-day/:dayId')
    @ApiOperation({ summary: 'Получить список расходов по ID дня бюджета' })
    @ApiResponse({ status: 200, description: 'Список расходов.', type: [ExpenseViewModel] })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    async byDay(@Param('dayId', ParseIntPipe) dayId: number): Promise<ExpenseViewModel[]> {
        const expenses = await this.service.findByDay(dayId);
        return expenses.map(expense => toExpenseViewModel(expense));
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить расход' })
    @ApiResponse({ status: 200, description: 'Расход успешно обновлен.', type: ExpenseViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для обновления расхода.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Расход не найден.' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() patch: Partial<CreateExpenseDto>,
    ): Promise<ExpenseViewModel> {
        const expense = await this.service.update(id, patch);
        return toExpenseViewModel(expense);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить расход' })
    @ApiResponse({ status: 200, description: 'Расход успешно удален.', type: Object })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Расход не найден.' })
    remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
        return this.service.remove(id);
    }
}