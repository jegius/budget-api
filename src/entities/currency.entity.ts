import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Budget } from './budget.entity';

@Entity('currencies')
export class Currency {
    @PrimaryGeneratedColumn() id: number;

    @Column({ length: 3, unique: true }) code: string; // USD, EUR
    @Column({ length: 50 }) name: string;
    @Column({ length: 10 }) symbol: string;

    @OneToMany(() => User, (u) => u.defaultCurrency) users: User[];
    @OneToMany(() => Budget, (b) => b.currency) budgets: Budget[];
}
