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
    @ApiResponse({ status: 200, description: 'Список валют.', type: [CurrencyViewModel] })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    findAll(): Promise<CurrencyViewModel[]> {
        return this.service.findAll();
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
