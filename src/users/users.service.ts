import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserProfileDto } from 'src/users/dto/update-user-profile.dto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserViewModel } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Currency } from '../entities/currency.entity';

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

    async update(id: number, patch: UpdateUserProfileDto, currentUserId: number): Promise<UserViewModel> { // <<< Меняем тип здесь
        if (id !== currentUserId) {
            throw new ForbiddenException('You can only update your own profile');
        }

        const user = await this.findOne(id);

        if (patch.defaultCurrencyId !== undefined) {
            if (patch.defaultCurrencyId === null) {
                user.defaultCurrency = null;
            } else {
                const currency = await this.repo.manager.findOne(Currency, {
                    where: { id: patch.defaultCurrencyId },
                }) as Currency;
                if (!currency) {
                    throw new BadRequestException(
                        `Currency with ID ${patch.defaultCurrencyId} not found`,
                    );
                }
                user.defaultCurrency = currency;
            }
        }

        // Теперь Object.assign не может получить password, так как его нет в UpdateUserProfileDto
        Object.assign(user, {
            ...(patch.username !== undefined && { username: patch.username }),
            ...(patch.email !== undefined && { email: patch.email }),
        });

        const updatedUser = await this.repo.save(user);
        return this.toViewModel(updatedUser);
    }

    async remove(id: number, currentUserId: number): Promise<{ success: boolean }> {
        if (id !== currentUserId) {
            throw new ForbiddenException('You can only delete your own account');
        }

        const user = await this.findOne(id);
        await this.repo.delete(id);
        return { success: true };
    }

    private toViewModel(user: User): UserViewModel {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            defaultCurrency: user.defaultCurrency
                ? {
                    id: user.defaultCurrency.id,
                    code: user.defaultCurrency.code,
                    name: user.defaultCurrency.name,
                    symbol: user.defaultCurrency.symbol,
                }
                : null,
            createdAt: user.created_at,
        };
    }
}