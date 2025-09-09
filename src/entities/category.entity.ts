import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Expense } from './expense.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn() id: number;

    @ManyToOne(() => User, (u) => u.categories, { onDelete: 'CASCADE' })
    user: User;

    @Column() name: string;
    @Column({ length: 16, default: '#000000' }) color: string;

    @OneToMany(() => Expense, (e) => e.category) expenses: Expense[];
}
