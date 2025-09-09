import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Budget } from '../entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { User } from '../entities/user.entity';
import { Currency } from '../entities/currency.entity';
import { BudgetViewModel } from './dto/budget-response.dto'; // Импортируем ViewModel

@Injectable()
export class BudgetsService {
    constructor(@InjectRepository(Budget) private repo: Repository<Budget>) {}

    async create(userId: number, dto: CreateBudgetDto): Promise<BudgetViewModel> {
        const budget = this.repo.create({
            name: dto.name,
            is_public: dto.isPublic,
            user: { id: userId } as User,
            currency: { id: dto.currencyId } as Currency,
        });
        const savedBudget = await this.repo.save(budget);
        // Преобразуем сущность в ViewModel
        return this.toViewModel(savedBudget);
    }

    async findAllByUser(userId: number): Promise<BudgetViewModel[]> {
        const budgets = await this.repo.find({
            where: { user: { id: userId } } as FindOptionsWhere<Budget>,
            relations: ['currency'],
        });
        // Преобразуем массив сущностей в массив ViewModel
        return budgets.map(b => this.toViewModel(b));
    }

    async update(userId: number, id: number, patch: Partial<CreateBudgetDto>): Promise<BudgetViewModel> {
        const b = await this.repo.findOne({
            where: { id, user: { id: userId } } as FindOptionsWhere<Budget>,
            relations: ['currency'] // Убедимся, что валюта загружена
        });
        if (!b) throw new NotFoundException();

        Object.assign(b, {
            ...(patch.name !== undefined && { name: patch.name }),
            ...(patch.isPublic !== undefined && { is_public: patch.isPublic }),
            ...(patch.currencyId && { currency: { id: patch.currencyId } as any }),
        });

        const updatedBudget = await this.repo.save(b);
        // Преобразуем сущность в ViewModel
        return this.toViewModel(updatedBudget);
    }

    async remove(userId: number, id: number): Promise<{ success: boolean }> {
        const r = await this.repo.delete({ id, user: { id: userId } as any });
        if (!r.affected) throw new NotFoundException();
        return { success: true };
    }

    // Метод для преобразования Budget entity в BudgetViewModel
    private toViewModel(budget: Budget): BudgetViewModel {
        return {
            id: budget.id,
            name: budget.name,
            isPublic: budget.is_public,
            createdAt: budget.created_at,
            currency: budget.currency ? {
                id: budget.currency.id,
                code: budget.currency.code,
                name: budget.currency.name,
                symbol: budget.currency.symbol
            } : null
        };
    }
}