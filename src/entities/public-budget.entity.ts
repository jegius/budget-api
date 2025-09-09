import { CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Budget } from './budget.entity';

@Entity('public_budgets')
export class PublicBudget {
    @PrimaryGeneratedColumn() budget_id: number; // PK=FK

    @OneToOne(() => Budget, (b) => b.publicBudget, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'budget_id' })
    budget: Budget;

    @CreateDateColumn() shared_at: Date;
}
