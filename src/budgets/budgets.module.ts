import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { Budget } from '../entities/budget.entity';
import { BudgetDaysModule } from '../budget-days/budget-days.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Budget]),
        BudgetDaysModule,
    ],
    controllers: [BudgetsController],
    providers: [BudgetsService],
    exports: [BudgetsService, TypeOrmModule],
})
export class BudgetsModule {}
