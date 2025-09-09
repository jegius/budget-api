import {
    Body,
    Controller,
    Get,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { ProfileViewModel } from './dto/profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
    constructor(private readonly service: ProfilesService) {}

    @Get('me')
    @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
    @ApiResponse({ status: 200, description: 'Профиль пользователя.', type: ProfileViewModel })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    getProfile(@CurrentUser() user): Promise<ProfileViewModel> {
        return this.service.getProfile(user.userId);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Обновить профиль текущего пользователя' })
    @ApiResponse({ status: 200, description: 'Профиль успешно обновлен.', type: ProfileViewModel })
    @ApiResponse({ status: 400, description: 'Неверные данные для обновления профиля.' })
    @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
    updateProfile(
        @CurrentUser() user,
        @Body() dto: UpdateProfileDto,
    ): Promise<ProfileViewModel> {
        return this.service.updateProfile(user.userId, dto);
    }
}