import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
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

    /**
     * Получает статистику расходов по дням за указанный месяц для пользователя.
     * @param userId ID пользователя.
     * @param year Год (например, 2024).
     * @param month Месяц (1-12).
     */
    async getExpensesByDay(
        userId: number,
        year: number,
        month: number,
        page: number = 1,
        limit: number = 10,
    ): Promise<PaginatedResponseDto<ExpenseByDayViewModel>> {
        // Валидация параметров месяца
        if (!Number.isInteger(year) || year < 1900 || year > 2100) {
            throw new BadRequestException(`Invalid year: ${year}. Year must be a 4-digit integer.`);
        }
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new BadRequestException(`Invalid month: ${month}. Month must be an integer between 1 and 12.`);
        }

        // Проверяем, существует ли пользователь и имеет ли он бюджеты
        const userExists = await this.dataSource
            .getRepository(Budget)
            .createQueryBuilder('b')
            .where('b.userId = :userId', { userId })
            .getCount();
        if (userExists === 0) {
            throw new NotFoundException(`User with ID ${userId} not found or has no budgets`);
        }

        // Форматируем начало и конец месяца для SQL
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Последний день месяца

        const expenses = await this.dataSource
            .createQueryBuilder(Expense, 'expense')
            .innerJoinAndSelect('expense.budgetDay', 'budgetDay')
            .innerJoinAndSelect('budgetDay.budget', 'budget')
            .innerJoinAndSelect('budget.currency', 'currency')
            .innerJoinAndSelect('expense.category', 'category')
            .where('budget.userId = :userId', { userId })
            .andWhere('budgetDay.date >= :startDate', { startDate })
            .andWhere('budgetDay.date <= :endDate', { endDate })
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
        }).sort((a, b) => a.date.localeCompare(b.date));

        // Применяем пагинацию к массиву дней
        const totalItems = result.length;
        const totalPages = Math.ceil(totalItems / limit);
        const data = result.slice((page - 1) * limit, page * limit);

        const meta: PaginationMetaDto = {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return { data, meta };
    }

    /**
     * Получает статистику по категориям за указанный месяц для пользователя.
     * @param userId ID пользователя.
     * @param year Год (например, 2024).
     * @param month Месяц (1-12).
     */
    async getCategoryStats(
        userId: number,
        year: number,
        month: number,
        page: number = 1,
        limit: number = 10,
    ): Promise<PaginatedResponseDto<CategoryStatsViewModel>> {
        // Валидация параметров месяца
        if (!Number.isInteger(year) || year < 1900 || year > 2100) {
            throw new BadRequestException(`Invalid year: ${year}. Year must be a 4-digit integer.`);
        }
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new BadRequestException(`Invalid month: ${month}. Month must be an integer between 1 and 12.`);
        }

        // Проверяем, существует ли пользователь и имеет ли он бюджеты
        const userExists = await this.dataSource
            .getRepository(Budget)
            .createQueryBuilder('b')
            .where('b.userId = :userId', { userId })
            .getCount();
        if (userExists === 0) {
            throw new NotFoundException(`User with ID ${userId} not found or has no budgets`);
        }

        // Форматируем начало и конец месяца для SQL
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Последний день месяца

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
            .andWhere('bd.date >= :startDate', { startDate })
            .andWhere('bd.date <= :endDate', { endDate })
            .groupBy('c.name, curr.id, curr.code, curr.name, curr.symbol')
            .getRawMany();

        const result = statsRaw.map(raw => ({
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

        const totalItems = result.length;
        const totalPages = Math.ceil(totalItems / limit);
        const data = result.slice((page - 1) * limit, page * limit);

        const meta: PaginationMetaDto = {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return { data, meta };
    }
}