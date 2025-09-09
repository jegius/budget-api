import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { PublicBudget } from '../entities/public-budget.entity';
import { PublicBudgetViewModel } from './dto/public-budget-response.dto';
import { Budget } from '../entities/budget.entity'; // <-- Добавлено

@Injectable()
export class PublicBudgetsService {
    constructor(
        @InjectRepository(PublicBudget) private repo: Repository<PublicBudget>,
        @InjectRepository(Budget) private budgetRepo: Repository<Budget>, // <-- Добавлено
        private dataSource: DataSource,
    ) {}

    async findAll(): Promise<PublicBudgetViewModel[]> {
        // Загружаем PublicBudget с необходимыми связями
        const publicBudgets = await this.repo.find({
            relations: ['budget', 'budget.user', 'budget.currency'],
        });
        // Извлекаем ID всех бюджетов для последующего запроса сумм
        const budgetIds = publicBudgets.map(pb => pb.budget.id);
        // Получаем суммы total_spent для всех бюджетов одним запросом
        // Используем COALESCE для обработки случаев, когда у бюджета нет дней или расходов
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
            // Преобразуем результат в удобный для поиска объект
            totalsRaw.forEach(row => {
                // Убедимся, что значение - это строка с двумя знаками после запятой
                totalsMap[row.budgetId] = parseFloat(row.totalSpent).toFixed(2);
            });
        }
        // Формируем ViewModel, используя вычисленные суммы
        return publicBudgets.map(pb => {
            const budgetId = pb.budget.id;
            // Получаем totalSpent из карты, если не найдено - 0.00
            const totalSpent = totalsMap[budgetId] ?? '0.00';
            return {
                budgetId: budgetId,
                userName: pb.budget.user.username,
                budgetName: pb.budget.name,
                currency: pb.budget.currency ? {
                    id: pb.budget.currency.id,
                    code: pb.budget.currency.code,
                    name: pb.budget.currency.name,
                    symbol: pb.budget.currency.symbol,
                } : null,
                sharedAt: pb.shared_at,
                totalSpent: totalSpent,
            };
        });
    }

    async publishBudget(userId: number, budgetId: number): Promise<void> {
        // Проверяем, существует ли бюджет и принадлежит ли он пользователю
        const budget = await this.budgetRepo.findOne({
            where: {
                id: budgetId,
                user: { id: userId }
            } as FindOptionsWhere<Budget>
        });
        if (!budget) {
            throw new ForbiddenException('Бюджет не найден или не принадлежит пользователю');
        }
        // Проверяем, не опубликован ли уже
        const existingPublicBudget = await this.repo.findOne({ where: { budget_id: budgetId } });
        if (existingPublicBudget) {
            // Можно просто ничего не делать или выбросить ошибку
            return;
        }
        const publicBudget = this.repo.create({ budget_id: budgetId });
        await this.repo.save(publicBudget);
    }

    async unpublishBudget(userId: number, budgetId: number): Promise<void> {
        // Проверяем, существует ли бюджет и принадлежит ли он пользователю
        const budget = await this.budgetRepo.findOne({
            where: {
                id: budgetId,
                user: { id: userId }
            } as FindOptionsWhere<Budget>
        });
        if (!budget) {
            throw new ForbiddenException('Бюджет не найден или не принадлежит пользователю');
        }
        await this.repo.delete({ budget_id: budgetId });
    }
}