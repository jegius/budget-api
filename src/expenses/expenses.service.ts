import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { BudgetDay } from '../entities/budget-day.entity';
import { Category } from '../entities/category.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private readonly repo: Repository<Expense>,
        @InjectRepository(BudgetDay)
        private readonly budgetDayRepo: Repository<BudgetDay>,
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
    ) {}

    async create(dto: CreateExpenseDto): Promise<Expense> {
        const budgetDay = await this.budgetDayRepo.findOne({ where: { id: dto.budgetDayId } });
        if (!budgetDay) {
            throw new BadRequestException(`BudgetDay with ID ${dto.budgetDayId} not found`);
        }

        const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
        if (!category) {
            throw new BadRequestException(`Category with ID ${dto.categoryId} not found`);
        }

        const expense = this.repo.create({
            amount: dto.amount,
            description: dto.description,
            budgetDay,
            category,
        });

        const saved = await this.repo.save(expense);
        await this.recalcDay(dto.budgetDayId);
        return this.findOne(saved.id);
    }

    async findOne(id: number): Promise<Expense> {
        const expense = await this.repo.findOne({
            where: { id },
            relations: ['category', 'budgetDay'],
        });
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }
        return expense;
    }

    async findByDay(budgetDayId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponseDto<Expense>> {
        const day = await this.budgetDayRepo.findOne({ where: { id: budgetDayId } });
        if (!day) {
            throw new BadRequestException(`BudgetDay with ID ${budgetDayId} not found`);
        }

        const [expenses, totalItems] = await this.repo.findAndCount({
            where: { budgetDay: { id: budgetDayId } } as FindOptionsWhere<Expense>,
            relations: ['category'],
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalPages = Math.ceil(totalItems / limit);

        const meta: PaginationMetaDto = {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return { data: expenses, meta };
    }

    async update(id: number, patch: Partial<CreateExpenseDto>): Promise<Expense> {
        const expense = await this.findOne(id); // проверяет существование

        if (patch.budgetDayId) {
            const budgetDay = await this.budgetDayRepo.findOne({ where: { id: patch.budgetDayId } });
            if (!budgetDay) {
                throw new BadRequestException(`BudgetDay with ID ${patch.budgetDayId} not found`);
            }
            expense.budgetDay = budgetDay;
        }

        if (patch.categoryId) {
            const category = await this.categoryRepo.findOne({ where: { id: patch.categoryId } });
            if (!category) {
                throw new BadRequestException(`Category with ID ${patch.categoryId} not found`);
            }
            expense.category = category;
        }

        if (patch.amount !== undefined) expense.amount = patch.amount;
        if (patch.description !== undefined) expense.description = patch.description;

        const saved = await this.repo.save(expense);
        await this.recalcDay(saved.budgetDay.id);
        return this.findOne(saved.id);
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

    private async recalcDay(budgetDayId: number): Promise<void> {
        const day = await this.budgetDayRepo.findOne({ where: { id: budgetDayId } });
        if (!day) {
            throw new BadRequestException(`BudgetDay with ID ${budgetDayId} not found during recalculation`);
        }

        const result = await this.repo
            .createQueryBuilder('expense')
            .select('SUM(expense.amount)', 'total')
            .where('expense.budgetDayId = :id', { id: budgetDayId })
            .getRawOne();

        day.total_spent = result.total || '0';
        await this.budgetDayRepo.save(day);
    }
}