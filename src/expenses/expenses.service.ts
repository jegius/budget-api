import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { BudgetDay } from '../entities/budget-day.entity';
import { Category } from '../entities/category.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense) private repo: Repository<Expense>,
        @InjectRepository(BudgetDay) private days: Repository<BudgetDay>,
    ) {}

    async findOne(id: number): Promise<Expense> {
        const expense = await this.repo.findOne({
            where: { id } as FindOptionsWhere<Expense>,
            relations: ['category', 'budgetDay']
        });
        if (!expense) throw new NotFoundException(`Expense with ID ${id} not found`);
        return expense;
    }

    async create(dto: CreateExpenseDto) {
        const exp = this.repo.create({
            amount: dto.amount,
            description: dto.description,
            budgetDay: { id: dto.budgetDayId } as BudgetDay,
            category: { id: dto.categoryId } as Category,
        });
        const saved = await this.repo.save(exp);
        await this.recalcDay(dto.budgetDayId);
        // Возвращаем полную сущность с relations для преобразования в контроллере
        return this.repo.findOne({
            where: { id: saved.id },
            relations: ['category', 'budgetDay']
        });
    }

    async findByDay(budgetDayId: number) {
        // Получаем расходы с категорией для преобразования в контроллере
        return this.repo.find({
            where: { budgetDay: { id: budgetDayId } } as FindOptionsWhere<Expense>,
            relations: ['category']
        });
    }

    async update(id: number, patch: Partial<CreateExpenseDto>) {
        const e = await this.repo.findOne({
            where: { id } as FindOptionsWhere<Expense>,
            relations: ['budgetDay']
        });
        if (!e) throw new NotFoundException();

        Object.assign(e, {
            ...(patch.amount !== undefined && { amount: patch.amount }),
            ...(patch.description !== undefined && { description: patch.description }),
            ...(patch.categoryId && { category: { id: patch.categoryId } as any }),
        });

        const res = await this.repo.save(e);
        await this.recalcDay(e.budgetDay.id);
        // Возвращаем полную сущность с relations для преобразования в контроллере
        return this.repo.findOne({
            where: { id: res.id },
            relations: ['category', 'budgetDay']
        });
    }

    async remove(id: number) {
        const e = await this.repo.findOne({
            where: { id } as FindOptionsWhere<Expense>,
            relations: ['budgetDay']
        });
        if (!e) throw new NotFoundException();
        await this.repo.delete(id);
        await this.recalcDay(e.budgetDay.id);
        return { success: true };
    }

    private async recalcDay(dayId: number) {
        const { sum } = await this.repo
            .createQueryBuilder('e')
            .select('COALESCE(SUM(e.amount),0)', 'sum')
            .where('e.budgetDayId = :dayId', { dayId })
            .getRawOne<{ sum: string }>();
        await this.days.update(dayId, { total_spent: sum });
    }
}