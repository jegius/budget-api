import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Budget } from './budget.entity';
import { Expense } from './expense.entity';

@Entity('budget_days')
export class BudgetDay {
    @PrimaryGeneratedColumn() id: number;

    @ManyToOne(() => Budget, (b) => b.days, { onDelete: 'CASCADE' })
    budget: Budget;

    @Column({ type: 'date' }) date: string;
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) total_spent: string;

    @OneToMany(() => Expense, (e) => e.budgetDay) expenses: Expense[];
}
