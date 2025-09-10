import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    ParseIntPipe,
    UseGuards, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { ApiPaginatedResponse } from 'src/common/swagger/paginated-api-response.decorator';
import { UserViewModel } from 'src/users/dto/user-response.dto';
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
    @ApiPaginatedResponse(UserViewModel)
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице', example: 10 })
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponseDto<PublicBudgetViewModel>> {
        return this.service.findAll(page, limit);
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