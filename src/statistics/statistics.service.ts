import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { Category } from '../entities/category.entity';
import { ExpenseByDayViewModel } from './dto/expense-by-day-response.dto';
import { CategoryStatsViewModel } from './dto/category-stats-response.dto';
import { Budget } from '../entities/budget.entity';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
        private dataSource: DataSource,
    ) {}

    async getExpensesByDay(userId: number): Promise<ExpenseByDayViewModel[]> {
        // Проверяем, существует ли пользователь
        const userExists = await this.dataSource
            .getRepository(Budget)
            .createQueryBuilder('b')
            .where('b.userId = :userId', { userId })
            .getCount();

        if (userExists === 0) {
            throw new NotFoundException(`User with ID ${userId} not found or has no budgets`);
        }

        const expenses = await this.dataSource
            .createQueryBuilder(Expense, 'expense')
            .innerJoinAndSelect('expense.budgetDay', 'budgetDay')
            .innerJoinAndSelect('budgetDay.budget', 'budget')
            .innerJoinAndSelect('budget.currency', 'currency')
            .innerJoinAndSelect('expense.category', 'category')
            .where('budget.userId = :userId', { userId })
            .orderBy('budgetDay.date', 'ASC')
            .addOrderBy('expense.created_at', 'ASC')
            .getMany();

        const groupedByDay: { [date: string]: ExpenseByDayViewModel } = {};

        for (const expense of expenses) {
            const dateStr = expense.budgetDay.date;
            if (!groupedByDay[dateStr]) {
                groupedByDay[dateStr] = {
                    date: dateStr,
                    totalSpent: '0.00',
                    currency: expense.budgetDay.budget.currency
                        ? {
                            id: expense.budgetDay.budget.currency.id,
                            code: expense.budgetDay.budget.currency.code,
                            name: expense.budgetDay.budget.currency.name,
                            symbol: expense.budgetDay.budget.currency.symbol,
                        }
                        : null,
                    expenses: [],
                };
            }

            groupedByDay[dateStr].expenses.push({
                id: expense.id,
                category: expense.category.name,
                amount: expense.amount,
                description: expense.description,
            });
        }

        const result: ExpenseByDayViewModel[] = Object.values(groupedByDay).map(day => {
            const total = day.expenses.reduce((sum, exp) => {
                return (parseFloat(sum) + parseFloat(exp.amount)).toFixed(2);
            }, '0.00');
            return { ...day, totalSpent: total };
        });

        return result.sort((a, b) => a.date.localeCompare(b.date));
    }

    async getCategoryStats(userId: number): Promise<CategoryStatsViewModel[]> {
        const userExists = await this.dataSource
            .getRepository(Budget)
            .createQueryBuilder('b')
            .where('b.userId = :userId', { userId })
            .getCount();

        if (userExists === 0) {
            throw new NotFoundException(`User with ID ${userId} not found or has no budgets`);
        }

        const statsRaw = await this.expenseRepo
            .createQueryBuilder('e')
            .select('c.name', 'category')
            .addSelect('SUM(e.amount)', 'totalSpent')
            .addSelect('COUNT(e.id)', 'count')
            .addSelect('curr.id', 'currencyId')
            .addSelect('curr.code', 'currencyCode')
            .addSelect('curr.name', 'currencyName')
            .addSelect('curr.symbol', 'currencySymbol')
            .leftJoin('e.category', 'c')
            .leftJoin('e.budgetDay', 'bd')
            .leftJoin('bd.budget', 'b')
            .leftJoin('b.currency', 'curr')
            .where('b.userId = :userId', { userId })
            .groupBy('c.name, curr.id, curr.code, curr.name, curr.symbol')
            .getRawMany();

        return statsRaw.map(raw => ({
            category: raw.category,
            totalSpent: parseFloat(raw.totalSpent).toFixed(2),
            count: parseInt(raw.count, 10),
            currency: {
                id: parseInt(raw.currencyId, 10),
                code: raw.currencyCode,
                name: raw.currencyName,
                symbol: raw.currencySymbol,
            },
        }));
    }
}