import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { PublicBudgetsService } from './public-budgets.service';
import { PublicBudgetViewModel } from './dto/public-budget-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('public-budgets')
@Controller('public-budgets')
export class PublicBudgetsController {
    constructor(private readonly service: PublicBudgetsService) {}

    @Get()
    @ApiOperation({ summary: 'Получить список всех публичных бюджетов' })
    @ApiResponse({ status: 200, description: 'Список публичных бюджетов.', type: [PublicBudgetViewModel] })
    findAll(): Promise<PublicBudgetViewModel[]> {
        return this.service.findAll();
    }

    @Post(':budgetId/publish')
    @ApiOperation({ summary: 'Опубликовать бюджет (сделать публичным)' })
    @ApiResponse({ status: 200, description: 'Бюджет успешно опубликован.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен (бюджет не принадлежит пользователю).' })
    @ApiResponse({ status: 404, description: 'Бюджет не найден.' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    publish(
        @CurrentUser() user,
        @Param('budgetId', ParseIntPipe) budgetId: number,
    ): Promise<void> {
        return this.service.publishBudget(user.userId, budgetId);
    }

    @Delete(':budgetId/unpublish')
    @ApiOperation({ summary: 'Снять бюджет с публикации' })
    @ApiResponse({ status: 200, description: 'Бюджет успешно снят с публикации.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен (бюджет не принадлежит пользователю).' })
    @ApiResponse({ status: 404, description: 'Бюджет не найден или не был опубликован.' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    unpublish(
        @CurrentUser() user,
        @Param('budgetId', ParseIntPipe) budgetId: number,
    ): Promise<void> {
        return this.service.unpublishBudget(user.userId, budgetId);
    }
}