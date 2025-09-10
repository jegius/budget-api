import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Budget } from '../entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { User } from '../entities/user.entity';
import { Currency } from '../entities/currency.entity';
import { BudgetViewModel } from './dto/budget-response.dto';

@Injectable()
export class BudgetsService {
    constructor(@InjectRepository(Budget) private repo: Repository<Budget>) {}

    async create(userId: number, dto: CreateBudgetDto): Promise<BudgetViewModel> {
        // Проверяем существование валюты
        const currency = await this.repo.manager.findOne(Currency, {
            where: { id: dto.currencyId },
        });
        if (!currency) {
            throw new BadRequestException(`Currency with ID ${dto.currencyId} not found`);
        }

        const budget = this.repo.create({
            name: dto.name,
            is_public: dto.isPublic,
            user: { id: userId } as User,
            currency: { id: dto.currencyId } as Currency,
        });

        const savedBudget = await this.repo.save(budget);
        return this.toViewModel(savedBudget);
    }

    async findAllByUser(userId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponseDto<BudgetViewModel>> {
        const [budgets, totalItems] = await this.repo.findAndCount({
            where: { user: { id: userId } } as FindOptionsWhere<Budget>,
            relations: ['currency'],
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalPages = Math.ceil(totalItems / limit);

        const data = budgets.map(b => this.toViewModel(b));

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


    async findOne(userId: number, id: number): Promise<BudgetViewModel> {
        const budget = await this.repo.findOne({
            where: { id, user: { id: userId } } as FindOptionsWhere<Budget>,
            relations: ['currency'],
        });
        if (!budget) {
            throw new NotFoundException(`Budget with ID ${id} not found or does not belong to user`);
        }
        return this.toViewModel(budget);
    }

    async update(
        userId: number,
        id: number,
        patch: Partial<CreateBudgetDto>,
    ): Promise<BudgetViewModel> {
        const budget = await this.findOne(userId, id); // уже проверяет 404

        if (patch.currencyId) {
            const currency = await this.repo.manager.findOne(Currency, {
                where: { id: patch.currencyId },
            });
            if (!currency) {
                throw new BadRequestException(`Currency with ID ${patch.currencyId} not found`);
            }
        }

        Object.assign(budget, {
            ...(patch.name !== undefined && { name: patch.name }),
            ...(patch.isPublic !== undefined && { is_public: patch.isPublic }),
            ...(patch.currencyId && { currency: { id: patch.currencyId } as any }),
        });

        const updatedBudget = await this.repo.save(budget);
        return this.toViewModel(updatedBudget);
    }

    async remove(userId: number, id: number): Promise<{ success: boolean }> {
        const budget = await this.findOne(userId, id);
        await this.repo.delete(id);
        return { success: true };
    }

    private toViewModel(budget: Budget): BudgetViewModel {
        return {
            id: budget.id,
            name: budget.name,
            isPublic: budget.is_public,
            createdAt: budget.created_at,
            currency: budget.currency
                ? {
                    id: budget.currency.id,
                    code: budget.currency.code,
                    name: budget.currency.name,
                    symbol: budget.currency.symbol,
                }
                : null,
        };
    }
}