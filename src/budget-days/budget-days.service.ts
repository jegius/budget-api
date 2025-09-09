import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toExpenseViewModel } from 'src/expenses/utils';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BudgetDay } from '../entities/budget-day.entity';
import { Budget } from '../entities/budget.entity';
import { CreateBudgetDayDto } from './dto/create-budget-day.dto';
import { BudgetDayViewModel } from './dto/budget-day-response.dto';
import { ExpensesService } from '../expenses/expenses.service';

@Injectable()
export class BudgetDaysService {
    constructor(
        @InjectRepository(BudgetDay) private repo: Repository<BudgetDay>,
        private expensesService: ExpensesService,
    ) {}

    async create(dto: CreateBudgetDayDto): Promise<BudgetDayViewModel> {
        const newDay = this.repo.create({
            budget: { id: dto.budgetId } as Budget,
            date: dto.date,
            total_spent: '0.00'
        });
        const savedDay = await this.repo.save(newDay);
        return this.findOne(savedDay.id);
    }

    async findOne(id: number): Promise<BudgetDayViewModel> {
        const day = await this.repo.findOne({
            where: { id },
            relations: ['budget', 'budget.currency']
        });
        if (!day) {
            throw new NotFoundException(`Budget day with ID ${id} not found`);
        }

        const expensesEntities = await this.expensesService.findByDay(id);
        const expensesViewModels = expensesEntities.map(expense => toExpenseViewModel(expense));

        return {
            id: day.id,
            date: day.date,
            totalSpent: day.total_spent,
            currency: day.budget?.currency ? {
                id: day.budget.currency.id,
                code: day.budget.currency.code,
                name: day.budget.currency.name,
                symbol: day.budget.currency.symbol
            } : null,
            expenses: expensesViewModels
        };
    }

    // Получить все дни бюджета по ID бюджета
    async findByBudget(budgetId: number): Promise<BudgetDayViewModel[]> {
        const days = await this.repo.find({
            where: { budget: { id: budgetId } } as FindOptionsWhere<BudgetDay>,
            order: { date: 'ASC' },
            relations: ['budget', 'budget.currency']
        });

        const daysWithExpenses = await Promise.all(
            days.map(async (day) => {
                const expensesEntities = await this.expensesService.findByDay(day.id);
                const expensesViewModels = expensesEntities.map(expense => toExpenseViewModel(expense)); // <-- Используем утилиту

                return {
                    id: day.id,
                    date: day.date,
                    totalSpent: day.total_spent,
                    currency: day.budget?.currency ? {
                        id: day.budget.currency.id,
                        code: day.budget.currency.code,
                        name: day.budget.currency.name,
                        symbol: day.budget.currency.symbol
                    } : null,
                    expenses: expensesViewModels
                };
            })
        );

        return daysWithExpenses;
    }

    async update(id: number, patch: Partial<CreateBudgetDayDto>): Promise<BudgetDayViewModel> {
        const day = await this.repo.findOne({ where: { id } });
        if (!day) {
            throw new NotFoundException(`Budget day with ID ${id} not found`);
        }

        Object.assign(day, patch);
        const updatedDay = await this.repo.save(day);
        return this.findOne(updatedDay.id); // Возвращаем обновленную ViewModel
    }

    // Удалить день бюджета
    async remove(id: number): Promise<{ success: boolean }> {
        const result = await this.repo.delete(id);
        if (!result.affected) {
            throw new NotFoundException(`Budget day with ID ${id} not found`);
        }
        return { success: true };
    }

    // Существующий метод findOrCreate можно оставить для внутреннего использования
    async findOrCreate(budgetId: number, date: string): Promise<BudgetDay> {
        let day = await this.repo.findOne({
            where: {
                budget: { id: budgetId },
                date: date
            } as FindOptionsWhere<BudgetDay>,
        });
        if (!day) {
            const newDay = this.repo.create({
                budget: { id: budgetId } as Budget,
                date: date,
                total_spent: '0.00'
            });
            day = await this.repo.save(newDay);
        }
        return day;
    }
}