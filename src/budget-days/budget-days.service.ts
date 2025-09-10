import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BudgetDay } from '../entities/budget-day.entity';
import { Budget } from '../entities/budget.entity';
import { CreateBudgetDayDto } from './dto/create-budget-day.dto';
import { BudgetDayViewModel } from './dto/budget-day-response.dto';
import { ExpensesService } from '../expenses/expenses.service';
import { toExpenseViewModel } from '../expenses/utils';

@Injectable()
export class BudgetDaysService {
    constructor(
        @InjectRepository(BudgetDay) private repo: Repository<BudgetDay>,
        private expensesService: ExpensesService,
    ) {}

    async create(dto: CreateBudgetDayDto): Promise<BudgetDayViewModel> {
        const budget = await this.repo.manager.findOne(Budget, {
            where: { id: dto.budgetId },
        });
        if (!budget) {
            throw new BadRequestException(`Budget with ID ${dto.budgetId} not found`);
        }

        const newDay = this.repo.create({
            budget: { id: dto.budgetId } as Budget,
            date: dto.date,
            total_spent: '0.00',
        });

        const savedDay = await this.repo.save(newDay);
        return this.findOne(savedDay.id);
    }

    async findOne(id: number): Promise<BudgetDayViewModel> {
        const day = await this.repo.findOne({
            where: { id },
            relations: ['budget', 'budget.currency'],
        });
        if (!day) {
            throw new NotFoundException(`Budget day with ID ${id} not found`);
        }

        const expensesEntities = await this.expensesService.findByDay(id);
        const expensesViewModels = expensesEntities?.data?.map(toExpenseViewModel);

        return {
            id: day.id,
            date: day.date,
            totalSpent: day.total_spent,
            currency: day.budget?.currency
                ? {
                    id: day.budget.currency.id,
                    code: day.budget.currency.code,
                    name: day.budget.currency.name,
                    symbol: day.budget.currency.symbol,
                }
                : null,
            expenses: expensesViewModels,
        };
    }

    async findByBudget(budgetId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponseDto<BudgetDayViewModel>> {
        const budget = await this.repo.manager.findOne(Budget, {
            where: { id: budgetId },
        });
        if (!budget) {
            throw new BadRequestException(`Budget with ID ${budgetId} not found`);
        }

        const [days, totalItems] = await this.repo.findAndCount({
            where: { budget: { id: budgetId } } as FindOptionsWhere<BudgetDay>,
            order: { date: 'ASC' },
            relations: ['budget', 'budget.currency'],
            skip: (page - 1) * limit,
            take: limit,
        });

        const daysWithExpenses = await Promise.all(
            days.map(async day => {
                const expensesEntities = await this.expensesService.findByDay(day.id);
                const expensesViewModels = expensesEntities?.data?.map(toExpenseViewModel);
                return {
                    id: day.id,
                    date: day.date,
                    totalSpent: day.total_spent,
                    currency: day.budget?.currency
                        ? {
                            id: day.budget.currency.id,
                            code: day.budget.currency.code,
                            name: day.budget.currency.name,
                            symbol: day.budget.currency.symbol,
                        }
                        : null,
                    expenses: expensesViewModels,
                };
            }),
        );

        const totalPages = Math.ceil(totalItems / limit);

        const meta: PaginationMetaDto = {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return { data: daysWithExpenses, meta };
    }
    async update(
        id: number,
        patch: Partial<CreateBudgetDayDto>,
    ): Promise<BudgetDayViewModel> {
        const day = await this.findOne(id);

        if (patch.budgetId) {
            const budget = await this.repo.manager.findOne(Budget, {
                where: { id: patch.budgetId },
            });
            if (!budget) {
                throw new BadRequestException(`Budget with ID ${patch.budgetId} not found`);
            }
        }

        Object.assign(day, patch);
        const updatedDay = await this.repo.save(day);
        return this.findOne(updatedDay.id);
    }

    async remove(id: number): Promise<{ success: boolean }> {
        const day = await this.findOne(id);
        await this.repo.delete(id);
        return { success: true };
    }

    async findOrCreate(budgetId: number, date: string): Promise<BudgetDay> {
        let day = await this.repo.findOne({
            where: {
                budget: { id: budgetId },
                date: date,
            } as FindOptionsWhere<BudgetDay>,
        });

        if (!day) {
            const budget = await this.repo.manager.findOne(Budget, {
                where: { id: budgetId },
            });
            if (!budget) {
                throw new BadRequestException(`Budget with ID ${budgetId} not found`);
            }

            const newDay = this.repo.create({
                budget: { id: budgetId } as Budget,
                date: date,
                total_spent: '0.00',
            });
            day = await this.repo.save(newDay);
        }

        return day;
    }
}