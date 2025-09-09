import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetDaysService } from './budget-days.service';
import { BudgetDaysController } from './budget-days.controller';
import { BudgetDay } from '../entities/budget-day.entity';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([BudgetDay]),
        ExpensesModule,
    ],
    controllers: [BudgetDaysController],
    providers: [BudgetDaysService],
    exports: [BudgetDaysService],
})
export class BudgetDaysModule {}
