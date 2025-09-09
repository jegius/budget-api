import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';

@Injectable()
export class CurrenciesService {
    constructor(@InjectRepository(Currency) private repo: Repository<Currency>) {}

    create(dto: CreateCurrencyDto) { return this.repo.save(this.repo.create(dto)); }
    findAll() { return this.repo.find(); }
    async findOne(id: number) {
        const c = await this.repo.findOne({ where: { id } });
        if (!c) throw new NotFoundException();
        return c;
    }
    async update(id: number, dto: Partial<CreateCurrencyDto>) {
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id: number) { await this.repo.delete(id); return { success: true }; }
}
