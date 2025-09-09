import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetsModule } from 'src/budgets/budgets.module';
import { PublicBudgetsController } from './public-budgets.controller';
import { PublicBudgetsService } from './public-budgets.service';
import { PublicBudget } from '../entities/public-budget.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PublicBudget]), BudgetsModule],
    controllers: [PublicBudgetsController],
    providers: [PublicBudgetsService],
    exports: [PublicBudgetsService],
})
export class PublicBudgetsModule {}