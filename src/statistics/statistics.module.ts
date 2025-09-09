import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Expense } from '../entities/expense.entity';
import { Category } from '../entities/category.entity';
import { BudgetDay } from '../entities/budget-day.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Expense, Category, BudgetDay])],
    controllers: [StatisticsController],
    providers: [StatisticsService],
})
export class StatisticsModule {}