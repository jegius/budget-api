import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileViewModel } from './dto/profile-response.dto';
import { BudgetsService } from '../budgets/budgets.service';
import { Currency } from '../entities/currency.entity';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(Profile) private profileRepo: Repository<Profile>,
        @InjectRepository(User) private userRepo: Repository<User>,
        private budgetsService: BudgetsService,
        private dataSource: DataSource,
    ) {}

    async getProfile(userId: number): Promise<ProfileViewModel> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['defaultCurrency', 'profile', 'budgets', 'budgets.currency'],
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const totalSpentRaw = await this.dataSource
            .createQueryBuilder()
            .select('COALESCE(SUM(e.amount), 0)', 'total')
            .from('expenses', 'e')
            .innerJoin('budget_days', 'bd', 'e.budgetDayId = bd.id') // Используем budgetDayId
            .innerJoin('budgets', 'b', 'bd.budgetId = b.id')         // Используем budgetId
            .where('b.userId = :userId', { userId })                 // Используем userId
            .getRawOne();

        const totalSpent = parseFloat(totalSpentRaw.total).toFixed(2);

        const budgetsViewModels = user.budgets.map(b => this.budgetsService['toViewModel'](b));

        return {
            userId: user.id,
            fullName: user.profile?.full_name ?? null,
            avatarUrl: user.profile?.avatar_url ?? null,
            bio: user.profile?.bio ?? null,
            defaultCurrency: user.defaultCurrency
                ? {
                    id: user.defaultCurrency.id,
                    code: user.defaultCurrency.code,
                    name: user.defaultCurrency.name,
                    symbol: user.defaultCurrency.symbol,
                }
                : null,
            totalSpent,
            budgets: budgetsViewModels,
        };
    }

    async updateProfile(userId: number, dto: UpdateProfileDto): Promise<ProfileViewModel> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        let profile = await this.profileRepo.findOne({ where: { user_id: userId } });
        if (!profile) {
            profile = this.profileRepo.create({
                user_id: userId,
                full_name: dto.fullName ?? null,
                avatar_url: dto.avatarUrl ?? null,
                bio: dto.bio ?? null,
            });
            await this.profileRepo.save(profile);
        } else {
            await this.profileRepo.update({ user_id: userId }, {
                full_name: dto.fullName,
                avatar_url: dto.avatarUrl,
                bio: dto.bio,
            });
        }

        if (dto.defaultCurrencyId !== undefined) {
            if (dto.defaultCurrencyId === null) {
                await this.userRepo.update({ id: userId }, { defaultCurrency: null });
            } else {
                const currency = await this.userRepo.manager.findOne(Currency, {
                    where: { id: dto.defaultCurrencyId },
                });
                if (!currency) {
                    throw new BadRequestException(
                        `Default currency with ID ${dto.defaultCurrencyId} not found`,
                    );
                }
                await this.userRepo.update({ id: userId }, {
                    defaultCurrency: { id: dto.defaultCurrencyId } as any,
                });
            }
        }

        return this.getProfile(userId);
    }
}