import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Currency } from './currency.entity';
import { BudgetDay } from './budget-day.entity';
import { PublicBudget } from './public-budget.entity';

@Entity('budgets')
export class Budget {
    @PrimaryGeneratedColumn() id: number;

    @ManyToOne(() => User, (u) => u.budgets, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Currency, (c) => c.budgets, { eager: true })
    currency: Currency;

    @Column({ length: 100 }) name: string;
    @Column({ default: false }) is_public: boolean;

    @CreateDateColumn() created_at: Date;

    @OneToMany(() => BudgetDay, (d) => d.budget) days: BudgetDay[];
    @OneToOne(() => PublicBudget, (pb) => pb.budget) publicBudget: PublicBudget;
}
