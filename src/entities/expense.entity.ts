import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BudgetDay } from './budget-day.entity';
import { Category } from './category.entity';

@Entity('expenses')
export class Expense {
    @PrimaryGeneratedColumn() id: number;

    @ManyToOne(() => BudgetDay, (d) => d.expenses, { onDelete: 'CASCADE' })
    budgetDay: BudgetDay;

    @ManyToOne(() => Category, (c) => c.expenses)
    category: Category;

    @Column({ type: 'decimal', precision: 12, scale: 2 }) amount: string; // может быть < 0
    @Column({ type: 'text', nullable: true }) description?: string;
    @CreateDateColumn() created_at: Date;
}