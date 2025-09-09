import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryViewModel } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
    constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

    async create(userId: number, dto: CreateCategoryDto): Promise<CategoryViewModel> {
        const category = this.repo.create({
            name: dto.name,
            color: dto.color || '#000000',
            user: { id: userId } as User,
        });
        const savedCategory = await this.repo.save(category);
        return this.toViewModel(savedCategory);
    }

    async findAllByUser(userId: number): Promise<CategoryViewModel[]> {
        const categories = await this.repo.find({
            where: { user: { id: userId } } as FindOptionsWhere<Category>,
        });
        return categories.map(c => this.toViewModel(c));
    }

    async findOne(userId: number, id: number): Promise<CategoryViewModel> {
        const category = await this.repo.findOne({
            where: { id, user: { id: userId } } as FindOptionsWhere<Category>,
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found or does not belong to user`);
        }
        return this.toViewModel(category);
    }

    async update(
        userId: number,
        id: number,
        patch: UpdateCategoryDto,
    ): Promise<CategoryViewModel> {
        const category = await this.findOne(userId, id);

        Object.assign(category, patch);
        const updatedCategory = await this.repo.save(category);
        return this.toViewModel(updatedCategory);
    }

    async remove(userId: number, id: number): Promise<{ success: boolean }> {
        await this.repo.delete(id);
        return { success: true };
    }

    private toViewModel(category: Category): CategoryViewModel {
        return {
            id: category.id,
            name: category.name,
            color: category.color,
        };
    }
}