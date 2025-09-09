import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from './currency.entity';
import { Profile } from './profile.entity';
import { Budget } from './budget.entity';
import { Category } from './category.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn() id: number;

    @Column({ length: 50, unique: true }) username: string;
    @Column({ length: 100, unique: true }) email: string;
    @Column({ type: 'text' }) password_hash: string;

    @ManyToOne(() => Currency, (c) => c.users, { eager: true, nullable: true })
    defaultCurrency: Currency;

    @CreateDateColumn() created_at: Date;

    @OneToOne(() => Profile, (p) => p.user) profile: Profile;
    @OneToMany(() => Budget, (b) => b.user) budgets: Budget[];
    @OneToMany(() => Category, (c) => c.user) categories: Category[];
}
