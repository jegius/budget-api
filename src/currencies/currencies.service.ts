import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';

@Injectable()
export class CurrenciesService {
    constructor(
        @InjectRepository(Currency)
        private readonly repo: Repository<Currency>,
    ) {}

    async create(dto: CreateCurrencyDto): Promise<Currency> {
        const existing = await this.repo.findOne({ where: { code: dto.code } });
        if (existing) {
            throw new BadRequestException(`Currency with code ${dto.code} already exists`);
        }
        const currency = this.repo.create(dto);
        return this.repo.save(currency);
    }

    async findAll(): Promise<Currency[]> {
        return this.repo.find();
    }

    async findOne(id: number): Promise<Currency> {
        const currency = await this.repo.findOne({ where: { id } });
        if (!currency) {
            throw new NotFoundException(`Currency with ID ${id} not found`);
        }
        return currency;
    }

    async update(id: number, dto: Partial<CreateCurrencyDto>): Promise<Currency> {
        const currency = await this.findOne(id); // уже проверяет 404

        if (dto.code) {
            const exists = await this.repo.findOne({ where: { code: dto.code } });
            if (exists && exists.id !== id) {
                throw new BadRequestException(`Currency code ${dto.code} is already taken`);
            }
        }

        Object.assign(currency, dto);
        return this.repo.save(currency);
    }

    async remove(id: number): Promise<{ success: boolean }> {
        const currency = await this.findOne(id);
        await this.repo.remove(currency);
        return { success: true };
    }
}