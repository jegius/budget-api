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
    @ApiResponse({ status: 200, description: 'Список бюджетов.', type: [BudgetViewModel] })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    mine(@CurrentUser() user): Promise<BudgetViewModel[]> {
        return this.service.findAllByUser(user.userId);
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