import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // <-- Импортируем DataSource
import { Profile } from '../entities/profile.entity';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileViewModel } from './dto/profile-response.dto';
import { BudgetsService } from '../budgets/budgets.service'; // Для получения бюджетов

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(Profile) private profileRepo: Repository<Profile>,
        @InjectRepository(User) private userRepo: Repository<User>,
        private budgetsService: BudgetsService, // Инъектируем BudgetsService
        private dataSource: DataSource, // <-- Добавлено для выполнения сырых запросов
    ) {}

    async getProfile(userId: number): Promise<ProfileViewModel> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['defaultCurrency', 'profile', 'budgets', 'budgets.currency'],
        });
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        // Вычисляем totalSpent (сумма всех расходов по всем бюджетам пользователя)
        // Используем DataSource для выполнения агрегирующего запроса
        const totalSpentRaw = await this.dataSource
            .createQueryBuilder()
            .select('COALESCE(SUM(e.amount), 0)', 'total')
            .from('expenses', 'e')
            .innerJoin('budget_days', 'bd', 'e.budget_day_id = bd.id')
            .innerJoin('budgets', 'b', 'bd.budget_id = b.id')
            .where('b.user_id = :userId', { userId })
            .getRawOne();

        const totalSpent = parseFloat(totalSpentRaw.total).toFixed(2);

        const budgetsViewModels = user.budgets.map(b => this.budgetsService['toViewModel'](b)); // Используем приватный метод из BudgetsService
        return {
            userId: user.id,
            fullName: user.profile?.full_name ?? null,
            avatarUrl: user.profile?.avatar_url ?? null,
            bio: user.profile?.bio ?? null,
            defaultCurrency: user.defaultCurrency ? {
                id: user.defaultCurrency.id,
                code: user.defaultCurrency.code,
                name: user.defaultCurrency.name,
                symbol: user.defaultCurrency.symbol,
            } : null,
            totalSpent, // <-- Обновлено: правильный подсчет
            budgets: budgetsViewModels,
        };
    }

    async updateProfile(userId: number, dto: UpdateProfileDto): Promise<ProfileViewModel> {
        // Обновляем профиль
        const profile = await this.profileRepo.findOne({ where: { user_id: userId } });
        if (!profile) {
            // Создаем профиль, если он не существует
            const newProfile = this.profileRepo.create({
                user_id: userId,
                full_name: dto.fullName ?? null,
                avatar_url: dto.avatarUrl ?? null,
                bio: dto.bio ?? null,
            });
            await this.profileRepo.save(newProfile);
        } else {
            await this.profileRepo.update({ user_id: userId }, {
                full_name: dto.fullName,
                avatar_url: dto.avatarUrl,
                bio: dto.bio,
            });
        }
        // Обновляем defaultCurrency у пользователя, если указан ID
        if (dto.defaultCurrencyId !== undefined) {
            await this.userRepo.update({ id: userId }, {
                defaultCurrency: dto.defaultCurrencyId ? { id: dto.defaultCurrencyId } as any : null,
            });
        }
        // Возвращаем обновленный профиль
        return this.getProfile(userId);
    }
}