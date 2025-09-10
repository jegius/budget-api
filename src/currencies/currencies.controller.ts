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
import { Currency } from 'src/entities/currency.entity';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { CurrencyViewModel } from './dto/currency-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('currencies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('currencies')
export class CurrenciesController {
    constructor(private readonly service: CurrenciesService) {}

    @Post()
    @ApiOperation({ summary: 'Создать новую валюту (только для администраторов)' })
    @ApiResponse({ status: 201, description: 'Валюта успешно создана.', type: CurrencyViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для создания валюты.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен.' })
    create(@Body() dto: CreateCurrencyDto): Promise<CurrencyViewModel> {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Получить список всех валют' })
    @ApiPaginatedResponse(CurrencyViewModel)
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице', example: 10 })
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponseDto<Currency>> {
        return this.service.findAll(page, limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить валюту по ID' })
    @ApiResponse({ status: 200, description: 'Информация о валюте.', type: CurrencyViewModel })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 404, description: 'Валюта не найдена.' })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<CurrencyViewModel> {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить валюту (только для администраторов)' })
    @ApiResponse({ status: 200, description: 'Валюта успешно обновлена.', type: CurrencyViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для обновления валюты.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен.' })
    @ApiResponse({ status: 404, description: 'Валюта не найдена.' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: Partial<CreateCurrencyDto>,
    ): Promise<CurrencyViewModel> {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить валюту (только для администраторов)' })
    @ApiResponse({ status: 200, description: 'Валюта успешно удалена.', type: Object })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен.' })
    @ApiResponse({ status: 404, description: 'Валюта не найдена.' })
    remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
        return this.service.remove(id);
    }
}
