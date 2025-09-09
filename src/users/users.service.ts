import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserViewModel } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) {}

    async findAll(): Promise<UserViewModel[]> {
        const users = await this.repo.find({ relations: ['defaultCurrency'] });
        return users.map(u => this.toViewModel(u));
    }

    async findOne(id: number): Promise<UserViewModel> {
        const user = await this.repo.findOne({ where: { id }, relations: ['defaultCurrency'] });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return this.toViewModel(user);
    }

    async update(id: number, patch: UpdateUserDto, currentUserId: number): Promise<UserViewModel> {
        // Проверка: пользователь может обновлять только себя, или это должен быть админ (логика админа не реализована)
        if (id !== currentUserId) {
            throw new ForbiddenException('You can only update your own profile');
        }

        const user = await this.repo.findOne({ where: { id }, relations: ['defaultCurrency'] });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        Object.assign(user, {
            ...(patch.username !== undefined && { username: patch.username }),
            ...(patch.email !== undefined && { email: patch.email }),
            // Обновление defaultCurrencyId должно быть в ProfilesService или через отдельный эндпоинт
            // так как это связано с профилем. Здесь оставим только базовые поля.
        });

        const updatedUser = await this.repo.save(user);
        return this.toViewModel(updatedUser);
    }

    async remove(id: number, currentUserId: number): Promise<{ success: boolean }> {
        // Проверка: пользователь может удалять только себя, или это должен быть админ
        if (id !== currentUserId) {
            throw new ForbiddenException('You can only delete your own account');
        }

        const result = await this.repo.delete(id);
        if (!result.affected) throw new NotFoundException(`User with ID ${id} not found`);
        return { success: true };
    }

    private toViewModel(user: User): UserViewModel {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            defaultCurrency: user.defaultCurrency ? {
                id: user.defaultCurrency.id,
                code: user.defaultCurrency.code,
                name: user.defaultCurrency.name,
                symbol: user.defaultCurrency.symbol,
            } : null,
            createdAt: user.created_at,
        };
    }
}
