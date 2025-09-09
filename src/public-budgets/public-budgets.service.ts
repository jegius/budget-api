import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { PublicBudget } from '../entities/public-budget.entity';
import { PublicBudgetViewModel } from './dto/public-budget-response.dto';
import { Budget } from '../entities/budget.entity';

@Injectable()
export class PublicBudgetsService {
    constructor(
        @InjectRepository(PublicBudget) private repo: Repository<PublicBudget>,
        @InjectRepository(Budget) private budgetRepo: Repository<Budget>,
        private dataSource: DataSource,
    ) {}

    async findAll(): Promise<PublicBudgetViewModel[]> {
        const publicBudgets = await this.repo.find({
            relations: ['budget', 'budget.user', 'budget.currency'],
        });

        const budgetIds = publicBudgets.map(pb => pb.budget.id);

        let totalsMap: { [budgetId: number]: string } = {};
        if (budgetIds.length > 0) {
            const totalsRaw = await this.dataSource
                .createQueryBuilder()
                .select('bd.budgetId', 'budgetId')
                .addSelect('COALESCE(SUM(bd.total_spent), 0)', 'totalSpent')
                .from('budget_days', 'bd')
                .where('bd.budgetId IN (:...budgetIds)', { budgetIds })
                .groupBy('bd.budgetId')
                .getRawMany();

            totalsRaw.forEach(row => {
                totalsMap[row.budgetId] = parseFloat(row.totalSpent).toFixed(2);
            });
        }

        return publicBudgets.map(pb => {
            const budgetId = pb.budget.id;
            const totalSpent = totalsMap[budgetId] ?? '0.00';
            return {
                budgetId: budgetId,
                userName: pb.budget.user.username,
                budgetName: pb.budget.name,
                currency: pb.budget.currency
                    ? {
                        id: pb.budget.currency.id,
                        code: pb.budget.currency.code,
                        name: pb.budget.currency.name,
                        symbol: pb.budget.currency.symbol,
                    }
                    : null,
                sharedAt: pb.shared_at,
                totalSpent: totalSpent,
            };
        });
    }

    async publishBudget(userId: number, budgetId: number): Promise<void> {
        const budget = await this.budgetRepo.findOne({
            where: {
                id: budgetId,
                user: { id: userId },
            } as FindOptionsWhere<Budget>,
            relations: ['user'],
        });

        if (!budget) {
            throw new ForbiddenException('Budget not found or does not belong to user');
        }

        const existing = await this.repo.findOne({ where: { budget_id: budgetId } });
        if (existing) {
            return; // Уже опубликован
        }

        const publicBudget = this.repo.create({ budget_id: budgetId });
        await this.repo.save(publicBudget);
    }

    async unpublishBudget(userId: number, budgetId: number): Promise<void> {
        const budget = await this.budgetRepo.findOne({
            where: {
                id: budgetId,
                user: { id: userId },
            } as FindOptionsWhere<Budget>,
        });

        if (!budget) {
            throw new ForbiddenException('Budget not found or does not belong to user');
        }

        const result = await this.repo.delete({ budget_id: budgetId });
        if (!result.affected) {
            throw new NotFoundException('Public budget not found');
        }
    }
}