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
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { BudgetViewModel } from './dto/budget-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
    constructor(private readonly service: BudgetsService) {}

    @Post()
    @ApiOperation({ summary: 'Создать новый бюджет' })
    @ApiResponse({ status: 201, description: 'Бюджет успешно создан.', type: BudgetViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для создания бюджета.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    create(
        @CurrentUser() user,
        @Body() dto: CreateBudgetDto,
    ): Promise<BudgetViewModel> {
        return this.service.create(user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Получить список своих бюджетов' })
    @ApiPaginatedResponse(CurrencyViewModel)
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице', example: 10 })
    mine(
        @CurrentUser() user,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponseDto<BudgetViewModel>> {
        return this.service.findAllByUser(user.userId, page, limit);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить бюджет' })
    @ApiResponse({ status: 200, description: 'Бюджет успешно обновлен.', type: BudgetViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для обновления бюджета.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Бюджет не найден.' })
    update(
        @CurrentUser() user,
        @Param('id', ParseIntPipe) id: number,
        @Body() patch: Partial<CreateBudgetDto>,
    ): Promise<BudgetViewModel> {
        return this.service.update(user.userId, id, patch);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить бюджет' })
    @ApiResponse({ status: 200, description: 'Бюджет успешно удален.', type: Object })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Бюджет не найден.' })
    remove(
        @CurrentUser() user,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ success: boolean }> {
        return this.service.remove(user.userId, id);
    }
}